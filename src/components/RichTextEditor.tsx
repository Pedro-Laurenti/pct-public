import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import React, { useState } from "react";
import { FaBold, FaItalic, FaParagraph, FaLink, FaListUl, FaListOl, FaQuoteLeft, FaCode, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaTerminal } from "react-icons/fa";
import { sanitize } from "@/lib/sanitize";
import { MdTitle } from "react-icons/md";
import { IoText } from "react-icons/io5";
import { LuMousePointerClick } from "react-icons/lu";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    title?: string;
    isDisabled?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    title,
    isDisabled = false,
}: RichTextEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [linkURL, setLinkURL] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [buttonURL, setButtonURL] = useState("");
    const [buttonTarget, setButtonTarget] = useState("_self");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
                orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
                blockquote: { HTMLAttributes: { class: "border-l-4 border-gray-300 pl-4 italic my-4" } },
            }),
            TextStyle, // Adicionar extensão TextStyle
            Link.configure({
                openOnClick: true,
                linkOnPaste: true,
                HTMLAttributes: { class: "underline cursor-pointer text-primary" },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
                defaultAlignment: "left",
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg prose-a:text-primary prose-strong:text-secondary-foreground focus:outline-none text-primary overflow-y-auto p-3 h-[700px] overflow-x-hidden border border-gray-300 rounded-md !max-w-none",
            },
        },
    });

    if (isDisabled) {
        return (
            <div dangerouslySetInnerHTML={{ __html: sanitize(value) }} />
        );
    }

    const toolbarButtons = [
        { isActive: () => editor?.isActive("bold"), onClick: () => editor?.chain().focus().toggleBold().run(), icon: <FaBold />, title: "Negrito" },
        { isActive: () => editor?.isActive("italic"), onClick: () => editor?.chain().focus().toggleItalic().run(), icon: <FaItalic />, title: "Itálico" }, // Botão de itálico
        { isActive: () => editor?.isActive("paragraph"), onClick: () => editor?.chain().focus().setParagraph().run(), icon: <FaParagraph />, title: "Parágrafo" },
        ...[1, 2, 3].map(level => ({
            isActive: () => editor?.isActive("heading", { level }),
            onClick: () => editor?.chain().focus().toggleHeading({ level: level as any }).run(),
            icon: <><MdTitle /> H{level}</>,
            title: `Título ${level}`,
        })),
        { isActive: () => editor?.isActive("bulletList"), onClick: () => editor?.chain().focus().toggleBulletList().run(), icon: <FaListUl />, title: "Lista com marcadores" },
        { isActive: () => editor?.isActive("orderedList"), onClick: () => editor?.chain().focus().toggleOrderedList().run(), icon: <FaListOl />, title: "Lista numerada" },
        { isActive: () => editor?.isActive("blockquote"), onClick: () => editor?.chain().focus().toggleBlockquote().run(), icon: <FaQuoteLeft />, title: "Citação" },
        { isActive: () => editor?.isActive("codeBlock"), onClick: () => editor?.chain().focus().toggleCodeBlock().run(), icon: <FaCode />, title: "Bloco de código" },
        ...["left", "center", "right", "justify"].map(alignment => ({
            isActive: () => editor?.isActive({ textAlign: alignment }),
            onClick: () => editor?.chain().focus().setTextAlign(alignment).run(),
            icon: alignment === "left" ? <FaAlignLeft /> : alignment === "center" ? <FaAlignCenter /> : alignment === "right" ? <FaAlignRight /> : <FaAlignJustify />,
            title: `Alinhar ${alignment}`,
        })),
        { isActive: () => false, onClick: () => setIsModalOpen(true), icon: <FaLink />, title: "Inserir link" },
        { isActive: () => false, onClick: () => setIsButtonModalOpen(true), icon: <LuMousePointerClick className="text-xl" />, title: "Inserir botão" },
        { isActive: () => isHtmlMode, onClick: () => setIsHtmlMode(!isHtmlMode), icon: isHtmlMode ? <IoText /> : <FaTerminal />, title: "Modo HTML" },
    ];

    return (
        <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-3">
                {title && <div className="text-sm">{title}</div>}
                <div className="btn-group flex flex-wrap">
                    {toolbarButtons.map((button, index) => (
                        <button
                            key={index}
                            className={`btn btn-sm ${button.isActive() ? "" : "btn-secondary"}`}
                            onClick={button.onClick}
                            title={button.title}
                        >
                            {button.icon}
                        </button>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Inserir Link</h3>
                        <input
                            type="text"
                            placeholder="Insira a URL do link"
                            className="input input-bordered w-full mt-4"
                            value={linkURL}
                            onChange={(e) => setLinkURL(e.target.value)}
                        />
                        <div className="modal-action">
                            <button className="btn btn-error" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (linkURL && editor) {
                                        editor.chain().focus().setLink({ href: linkURL }).run();
                                        setLinkURL("");
                                        setIsModalOpen(false);
                                    }
                                }}
                            >
                                Inserir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isButtonModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Inserir Botão</h3>
                        
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Texto do Botão</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Digite o texto do botão"
                                className="input input-bordered w-full"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">URL do Botão</span>
                            </label>
                            <input
                                type="text"
                                placeholder="https://exemplo.com"
                                className="input input-bordered w-full"
                                value={buttonURL}
                                onChange={(e) => setButtonURL(e.target.value)}
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Abrir Link</span>
                            </label>
                            <select 
                                className="select select-bordered w-full"
                                value={buttonTarget}
                                onChange={(e) => setButtonTarget(e.target.value)}
                            >
                                <option value="_self">Na mesma página</option>
                                <option value="_blank">Em nova aba</option>
                            </select>
                        </div>

                        <div className="modal-action">
                            <button 
                                className="btn btn-error" 
                                onClick={() => {
                                    setIsButtonModalOpen(false);
                                    setButtonText("");
                                    setButtonURL("");
                                    setButtonTarget("_self");
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (buttonText && buttonURL && editor) {
                                        const buttonHTML = `<a role="button" href="${buttonURL}" target="${buttonTarget}" class="btn btn-primary text-primary-content !text-primary-content" data-button="true">${buttonText}</a>`;
                                        editor.chain().focus().insertContent(buttonHTML).run();
                                        setButtonText("");
                                        setButtonURL("");
                                        setButtonTarget("_self");
                                        setIsButtonModalOpen(false);
                                    }
                                }}
                                disabled={!buttonText || !buttonURL}
                            >
                                Inserir Botão
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isHtmlMode ? (
                <textarea
                    value={editor?.getHTML() || ""}
                    onChange={(e) => editor?.commands.setContent(e.target.value)}
                    placeholder={placeholder}
                    className="textarea textarea-bordered w-full min-h-[200px] p-3"
                />
            ) : (
                <EditorContent editor={editor} placeholder={placeholder} />
            )}
        </div>
    );
}