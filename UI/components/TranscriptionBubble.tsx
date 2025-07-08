import { useTranscriptions } from "@livekit/components-react";

export default function TranscriptionBubble() {
  const transcripts: any[] = useTranscriptions();
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg min-h-[80px]">
      <p className="text-lg text-center text-foreground leading-snug">
        {transcripts.map((entry: any, i: number) => (
          <span
            key={i}
            className={`${entry.isFinal ? "text-foreground" : "text-muted-foreground"}`}
          >
            {entry.text}
          </span>
        ))}
      </p>
    </div>
  );
}
