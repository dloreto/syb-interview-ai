import "./home.css";
import docHtml from "../assets/doc.html?raw";
import { useState } from "react";
import TurndownService from "turndown";
import { marked } from "marked";

const turndownService = new TurndownService({
	headingStyle: "atx", // Use # style headings
	codeBlockStyle: "fenced",
	blankReplacement: () => "\n​\n\n",
});

// Add custom rule for mention spans
turndownService.addRule("mentions", {
	filter: (node) => {
		return node.nodeName === "SPAN" && node.getAttribute("data-type") === "mention";
	},
	replacement: (content, node) => {
		if (!(node instanceof HTMLElement)) return content;

		const userId = node.getAttribute("data-id");
		const userUrl = `/syb-interview-ai/user?id=${userId}`;
		// Remove @ symbol from the markdown link
		return `[${content}](${userUrl})`;
	},
});

const convertHtmlToMarkdown = (html: string): string => {
	const fragment = document.createDocumentFragment();
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;
	fragment.appendChild(tempDiv);
	return turndownService.turndown(tempDiv.innerHTML);
};

const convertMarkdownToHtml = (markdown: string): string => {
	// First convert markdown to HTML using marked synchronously
	const html = marked.parse(markdown, { async: false }) as string;

	// Create a document fragment to manipulate the HTML
	const fragment = document.createDocumentFragment();
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;
	fragment.appendChild(tempDiv);

	// Convert non-breaking space paragraphs to empty paragraphs
	fragment.querySelectorAll("p").forEach((p) => {
		if (p.innerHTML.trim() === "​") {
			// Zero width space
			p.innerHTML = "";
		}
	});

	// Convert mention links back to spans with proper styling
	fragment.querySelectorAll("a").forEach((a) => {
		const text = a.textContent;
		const href = a.getAttribute("href");

		debugger;

		// Check if it's a mention link (contains /syb-interview-ai/user/)
		if (href?.includes(`${import.meta.env.BASE_URL}user`)) {
			const userId = href.split("/user/")[1];
			const userName = text;

			const mentionSpan = document.createElement("span");
			mentionSpan.setAttribute("data-type", "mention");
			mentionSpan.setAttribute("data-id", userId);
			mentionSpan.textContent = userName;

			// Create a new anchor tag to wrap the mention span
			const mentionLink = document.createElement("a");
			mentionLink.href = href;
			mentionLink.appendChild(mentionSpan);

			a.replaceWith(mentionLink);
		}
	});

	return tempDiv.innerHTML;
};

interface ClipboardData {
	text: string;
	html: string;
}

export default function Home() {
	const [markdownContent, setMarkdownContent] = useState("");
	const [processedHtml, setProcessedHtml] = useState("");
	const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

	const handleProcessToMarkdown = () => {
		const docElement = document.querySelector(".Home-doc");
		if (docElement) {
			const markdown = convertHtmlToMarkdown(docElement.innerHTML);
			setMarkdownContent(markdown);
			setProcessedHtml("");
		}
	};

	const handleProcessToHtml = () => {
		const html = convertMarkdownToHtml(markdownContent);
		setProcessedHtml(html);
	};

	const handleCopyToClipboard = async () => {
		const div = document.createElement("div");
		div.innerHTML = processedHtml;

		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					"text/plain": new Blob([div.textContent || ""], {
						type: "text/plain",
					}),
					"text/html": new Blob([div.innerHTML], { type: "text/html" }),
				}),
			]);
			alert("Content copied to clipboard in both formats!");
		} catch (err) {
			console.error("Failed to copy:", err);
			alert("Failed to copy to clipboard");
		}
	};

	const handlePaste = async (e: React.ClipboardEvent) => {
		e.preventDefault();
		const data: ClipboardData = {
			text: e.clipboardData.getData("text/plain"),
			html: e.clipboardData.getData("text/html"),
		};
		setClipboardData(data);
	};

	return (
		<div className="Home">
			<div className="Home-doc" dangerouslySetInnerHTML={{ __html: docHtml }} />
			<div className="Home-doc-actions">
				<button className="Home-process-button" onClick={handleProcessToMarkdown}>
					Process to markdown
				</button>
			</div>

			{markdownContent && (
				<>
					<div className="Home-markdown">{markdownContent}</div>
					<div className="Home-markdown-actions">
						<button className="Home-process-button" onClick={handleProcessToHtml}>
							Process back to html
						</button>
					</div>
				</>
			)}

			{processedHtml && (
				<>
					<div className="Home-doc" dangerouslySetInnerHTML={{ __html: processedHtml }} />
					<div className="Home-doc-actions">
						<button className="Home-process-button" onClick={handleCopyToClipboard}>
							Copy to clipboard
						</button>
						<textarea className="Home-paste-area" onPaste={handlePaste} placeholder="Paste here" readOnly />
					</div>
				</>
			)}

			{clipboardData && (
				<div className="Home-clipboard-data">
					<div className="Home-clipboard-section">
						<h3>text/plain:</h3>
						<pre>{clipboardData.text}</pre>
					</div>
					<div className="Home-clipboard-section">
						<h3>text/html:</h3>
						<pre>{clipboardData.html}</pre>
					</div>
				</div>
			)}
		</div>
	);
}
