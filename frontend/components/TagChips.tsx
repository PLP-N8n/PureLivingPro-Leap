import { cn } from "@/lib/utils";

interface Tag {
  id: string | number;
  name: string;
}

interface TagChipsProps {
  tags: Tag[];
  selectedTagId?: string | number;
  onSelectTag: (tagId: string | number) => void;
  className?: string;
}

export function TagChips({ tags, selectedTagId, onSelectTag, className }: TagChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelectTag(tag.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectTag(tag.id);
            }
          }}
          role="radio"
          aria-checked={selectedTagId === tag.id}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
            selectedTagId === tag.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-primary/20"
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
