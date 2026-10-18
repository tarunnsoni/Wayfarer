import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TripMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      table: ({ node, ...props }) => (
        <div className="my-4 max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" role="region" aria-label="Trip details table" tabIndex={0}>
          <table {...props} />
        </div>
      ),
      a: ({ node, ...props }) => (
        <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80" />
      ),
    }}>{children}</ReactMarkdown>
  );
}
