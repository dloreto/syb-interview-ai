import type { Config } from "@react-router/dev/config";

export default {
	// Disable SSR since we want static pre-rendering
	ssr: false,
	basename: "/syb-interview-ai/",
	// Pre-render all routes at build time
	async prerender() {
		return ["/", "/user"];
	},
} satisfies Config;
