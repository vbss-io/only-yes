import {
  ArrowArcLeft,
  ArrowArcRight,
  HighlighterCircle,
  Image,
  ListBullets,
  ListNumbers,
  PaintBrush,
  PaintBucket,
  Quotes,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextTSlash,
} from "@phosphor-icons/react";
import { Editor } from "@tiptap/react";
import { useState } from "react";
import { Input } from "vbss-ui";
import * as S from "./styles";

interface EditorMenuProps {
  editor: Editor | null;
}

export const EditorMenu = ({ editor }: EditorMenuProps) => {
  const [imageUrl, setImageUrl] = useState("");

  const addImage = () => {
    const addImageModal = document.getElementById("addImageModal");
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    const addImageModalCloseButton = addImageModal
      ?.childNodes[2] as HTMLButtonElement;
    setImageUrl("");
    addImageModalCloseButton?.click();
  };

  if (!editor) {
    return null;
  }

  return (
    <S.Container className="control-group">
      <S.Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        variant="ghost"
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <ArrowArcLeft />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        variant="ghost"
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <ArrowArcRight />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        variant={editor.isActive("bold") ? "primary" : "ghost"}
        active={editor.isActive("bold")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextB />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        variant={editor.isActive("italic") ? "primary" : "ghost"}
        active={editor.isActive("italic")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextItalic />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        variant={editor.isActive("strike") ? "primary" : "ghost"}
        active={editor.isActive("strike")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextStrikethrough />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        variant={editor.isActive("highlight") ? "primary" : "ghost"}
        active={editor.isActive("highlight")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <HighlighterCircle />
      </S.Button>
      <S.ColorInputContainer>
        <S.Button
          variant="ghost"
          type="button"
          size="icon-sm"
          rounded="full"
          color={!!editor.getAttributes("textStyle")?.color}
          style={{
            "--color": editor.getAttributes("textStyle")?.color,
          }}
        >
          <PaintBrush />
        </S.Button>
        <S.ColorInput
          type="color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />
      </S.ColorInputContainer>
      <S.ColorInputContainer>
        <S.Button
          variant="ghost"
          type="button"
          size="icon-sm"
          rounded="full"
          backgroundColor={!!editor.getAttributes("textStyle")?.backgroundColor}
          style={{
            "--backgroundColor":
              editor.getAttributes("textStyle")?.backgroundColor,
          }}
        >
          <PaintBucket />
        </S.Button>
        <S.ColorInput
          type="color"
          onChange={(e) =>
            editor.chain().focus().setBackColor(e.target.value).run()
          }
        />
      </S.ColorInputContainer>
      <S.Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        variant={editor.isActive("heading", { level: 1 }) ? "primary" : "ghost"}
        active={editor.isActive("heading", { level: 1 })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextHOne />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        variant={editor.isActive({ textAlign: "left" }) ? "primary" : "ghost"}
        active={editor.isActive({ textAlign: "left" })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextAlignLeft />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        variant={editor.isActive({ textAlign: "center" }) ? "primary" : "ghost"}
        active={editor.isActive({ textAlign: "center" })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextAlignCenter />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        variant={editor.isActive({ textAlign: "right" }) ? "primary" : "ghost"}
        active={editor.isActive({ textAlign: "right" })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextAlignRight />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={editor.isActive("heading", { level: 2 }) ? "primary" : "ghost"}
        active={editor.isActive("heading", { level: 2 })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextHTwo />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        variant={editor.isActive("heading", { level: 3 }) ? "primary" : "ghost"}
        active={editor.isActive("heading", { level: 3 })}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextHThree />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive("bulletList") ? "primary" : "ghost"}
        active={editor.isActive("bulletList")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <ListBullets />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive("orderedList") ? "primary" : "ghost"}
        active={editor.isActive("orderedList")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <ListNumbers />
      </S.Button>
      <S.Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        variant={editor.isActive("blockquote") ? "primary" : "ghost"}
        active={editor.isActive("blockquote")}
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <Quotes />
      </S.Button>
      <S.Dialog
        id="addImageModal"
        title="Adicionar Imagem"
        description="Insira uma URL válida para a imagem"
        trigger={
          <S.Button
            as="div"
            onClick={addImage}
            variant="ghost"
            type="button"
            size="icon-sm"
            rounded="full"
          >
            <Image />
          </S.Button>
        }
      >
        <Input
          rounded="full"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          buttonProps={{
            children: <Image color="white" width="1.3rem" height="1.3rem" />,
            onClick: () => addImage(),
          }}
        />
      </S.Dialog>
      <S.Button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        variant="ghost"
        type="button"
        size="icon-sm"
        rounded="full"
      >
        <TextTSlash />
      </S.Button>
    </S.Container>
  );
};
