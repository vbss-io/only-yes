import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { BackColor } from "./Extensions/BackColor";
import { EditorMenu } from "./Menu";
import * as S from "./styles";

interface EditorProps {
  content?: string;
  setContent?: (content: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  videoUrl?: string;
  viewMode?: boolean;
}

export const Editor = ({
  content,
  setContent,
  label,
  placeholder,
  error,
  videoUrl,
  viewMode = false,
}: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
      Image.configure({
        allowBase64: true,
      }),
      TextStyle,
      Color,
      BackColor,
      Youtube.configure({
        autoplay: true,
      }),
    ],
    content: content ?? "",
    onUpdate({ editor }) {
      if (viewMode) return;
      setContent && setContent(editor.getHTML());
    },
    editable: !viewMode,
  });

  useEffect(() => {
    if (videoUrl) {
      const editorWidth =
        document.getElementsByClassName("editorVideo")[0].clientWidth;
      const baseWidth = 542;
      const baseHeight = 360;
      editor?.commands.setYoutubeVideo({
        src: videoUrl,
        width: editorWidth - 30,
        height: (editorWidth * baseHeight) / baseWidth,
      });
    }
  }, [videoUrl]);

  return (
    <S.Container viewMode>
      {label && <S.EditorLabel>{label}</S.EditorLabel>}
      {!viewMode && <EditorMenu editor={editor} />}
      <S.EditorContainer>
        <EditorContent
          editor={editor}
          className={videoUrl ? "editorVideo" : ""}
        />
        {error && <S.EditorError>{error}</S.EditorError>}
      </S.EditorContainer>
    </S.Container>
  );
};
