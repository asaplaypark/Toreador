"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        active
          ? "bg-sepia text-sepia-cream"
          : "text-sepia hover:bg-sepia-pale/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "เขียนเนื้อหาที่นี่...",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    // Do not use `content` here — we set it via useEffect below
    // to guarantee the correct value even when the prop arrives after mount
    content: "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-[300px] px-4 py-3 prose prose-sm max-w-none news-content",
      },
    },
    immediatelyRender: false,
  });

  // Sync initial value into editor once it's ready.
  // This avoids the race where onUpdate fires with <p></p> before
  // the real content is set, which would overwrite the parent form state.
  useEffect(() => {
    if (!editor || !value) return;
    // Only set if the editor is still showing its empty initial state
    if (editor.isEmpty) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]); // eslint-disable-line react-hooks/exhaustive-deps

  function setLink() {
    const prev = editor?.getAttributes("link").href ?? "";
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage() {
    const url = window.prompt("URL รูปภาพ:");
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5"
        style={{ backgroundColor: "var(--sepia-cream)" }}
      >
        <ToolbarButton
          title="ตัวหนา"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="ตัวเอียง"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="ขีดเส้นใต้"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-sepia-pale/60" />

        <ToolbarButton
          title="หัวข้อ 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="หัวข้อ 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="หัวข้อ 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-sepia-pale/60" />

        <ToolbarButton
          title="รายการหัวข้อย่อย"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="รายการตัวเลข"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-sepia-pale/60" />

        <ToolbarButton
          title="แทรกลิงก์"
          onClick={setLink}
          active={editor.isActive("link")}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton title="แทรกรูปภาพ" onClick={insertImage}>
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-sepia-pale/60" />

        <ToolbarButton
          title="ชิดซ้าย"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="กึ่งกลาง"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          title="ชิดขวา"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
