"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Redo, Undo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "default" | "job-post";
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  variant = "default",
}: RichTextEditorProps) {
  const isJobPost = variant === "job-post";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[150px] w-full rounded-b-2xl border-x border-b bg-transparent px-5 py-4 text-sm leading-7 text-slate-700 outline-none focus:outline-none",
          "prose prose-sm max-w-none",
          "[&_p]:m-0",
          "[&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:pl-2",
          "[&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:pl-2",
          "[&_li]:my-1 [&_li]:pl-1",
          "[&_li_p]:m-0",
          isJobPost ? "border-slate-200/90 bg-white/90" : "border-slate-300"
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();

    if ((value || "") !== currentHtml) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;

  const isEmpty = !editor.getText().trim();

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isJobPost && [
          "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(99,102,241,0.12)]",
          "focus-within:-translate-y-0.5",
          "focus-within:shadow-[0_10px_32px_rgba(99,102,241,0.16)]",
          "focus-within:ring-4 focus-within:ring-indigo-500/10",
        ]
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-t-2xl border bg-white px-3 py-2",
          isJobPost ? "border-slate-200/90" : "border-slate-300"
        )}
      >
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 rounded-lg"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 rounded-lg"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 rounded-lg"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 rounded-lg"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 rounded-lg"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 rounded-lg"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <EditorContent editor={editor} />

        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-5 top-4 text-sm text-slate-400">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}