import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/js/**/tests.ts"]
	}
});
