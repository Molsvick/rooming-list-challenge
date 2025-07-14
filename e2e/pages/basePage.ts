import { Page, expect, Locator } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(): Promise<void> {
        await this.page.goto('http://localhost:3000');
    }

    cleanEventName(name: string | null | undefined): string {
        if (name === null || name === undefined) {
            return '';
        }
        return name.replace(/^\[|\]$/g, '').trim();
    }
}