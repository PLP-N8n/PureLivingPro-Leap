import { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = Array.from(doc.querySelectorAll('h2, h3'));

    const extractedHeadings = headingElements.map((el) => {
      const text = el.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      el.id = id;
      return {
        id,
        text,
        level: parseInt(el.tagName.substring(1)),
      };
    });

    setHeadings(extractedHeadings);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const elements = document.querySelectorAll('h2, h3');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-24 hidden lg:block">
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <List className="h-5 w-5 mr-2" />
          Table of Contents
        </h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  'transition-colors',
                  heading.level === 3 && 'ml-4',
                  activeId === heading.id
                    ? 'text-primary font-semibold'
                    : 'text-gray-600 hover:text-primary'
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
