// Call recorder: records one CoreAudio input device (e.g. "BlackHole 2ch") to a mono WAV until SIGTERM/SIGINT.
// Replaces ffmpeg's avfoundation input, which left 0.107 s of silence about once a second in real calls on
// 2026-10-16 (a steady tone had 9 holes in 8 s). capture/caller.js builds it when the binary is missing.
// build: swiftc -O capture/cablerec.swift -o capture/cablerec      run: capture/cablerec "BlackHole 2ch" out.wav
import AVFoundation
import CoreAudio

func deviceID(named name: String) -> AudioDeviceID? {
    var addr = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDevices, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var size: UInt32 = 0
    AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size)
    var ids = [AudioDeviceID](repeating: 0, count: Int(size) / MemoryLayout<AudioDeviceID>.size)
    AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size, &ids)
    for id in ids {
        var n: CFString = "" as CFString; var s = UInt32(MemoryLayout<CFString>.size)
        var a = AudioObjectPropertyAddress(mSelector: kAudioObjectPropertyName, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        if AudioObjectGetPropertyData(id, &a, 0, nil, &s, &n) == noErr, (n as String) == name {
            var ia = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyStreams, mScope: kAudioObjectPropertyScopeInput, mElement: kAudioObjectPropertyElementMain)
            var isz: UInt32 = 0; AudioObjectGetPropertyDataSize(id, &ia, 0, nil, &isz)
            if isz > 0 { return id }
        }
    }
    return nil
}

let args = CommandLine.arguments
guard args.count == 3, let dev = deviceID(named: args[1]) else { FileHandle.standardError.write("usage: cablerec <input device name> <out.wav> (device not found?)\n".data(using: .utf8)!); exit(2) }
let engine = AVAudioEngine()
let input = engine.inputNode
var d = dev
let st = AudioUnitSetProperty(input.audioUnit!, kAudioOutputUnitProperty_CurrentDevice, kAudioUnitScope_Global, 0, &d, UInt32(MemoryLayout<AudioDeviceID>.size))
guard st == noErr else { FileHandle.standardError.write("cannot select device (\(st))\n".data(using: .utf8)!); exit(3) }
let inFmt = input.outputFormat(forBus: 0)
let outFmt = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: inFmt.sampleRate, channels: 1, interleaved: false)!
var fileBox: AVAudioFile? = try! AVAudioFile(forWriting: URL(fileURLWithPath: args[2]), settings: [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: inFmt.sampleRate, AVNumberOfChannelsKey: 1, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false], commonFormat: .pcmFormatFloat32, interleaved: false)
var frames: Int64 = 0
input.installTap(onBus: 0, bufferSize: 4096, format: inFmt) { buf, _ in
    let n = buf.frameLength
    guard let mono = AVAudioPCMBuffer(pcmFormat: outFmt, frameCapacity: n) else { return }
    mono.frameLength = n
    memcpy(mono.floatChannelData![0], buf.floatChannelData![0], Int(n) * MemoryLayout<Float>.size)   // channel 1 of the cable
    try? fileBox?.write(from: mono); frames += Int64(n)
}
try! engine.start()
print("recording \(args[1]) at \(Int(inFmt.sampleRate)) Hz, \(inFmt.channelCount) ch -> \(args[2])"); fflush(stdout)
var sources: [DispatchSourceSignal] = []
for sig in [SIGTERM, SIGINT] {
    signal(sig, SIG_IGN)
    let s = DispatchSource.makeSignalSource(signal: sig, queue: .main)
    s.setEventHandler { input.removeTap(onBus: 0); engine.stop(); fileBox = nil; print("frames \(frames)"); exit(0) }   // nil closes the WAV
    s.resume(); sources.append(s)
}
RunLoop.main.run()
