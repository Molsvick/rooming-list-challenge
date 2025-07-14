import { Page, Locator, expect } from '@playwright/test';

export class FilterModal {
    readonly page: Page;
    readonly modalContainer: Locator;
    readonly saveButton: Locator;
    readonly activeCheckbox: Locator;
    readonly closedCheckbox: Locator;
    readonly cancelledCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.modalContainer = page.locator('.sc-kRYMvn.izAvVc');
        this.saveButton = this.modalContainer.locator('button.sc-pIQYQ.jSnEUI');
        this.activeCheckbox = this.modalContainer.locator('div.sc-hTEpIc.fqvlOP:has-text("Active")'); 
        this.closedCheckbox = this.modalContainer.locator('div.sc-hTEpIc.fqvlOP:has-text("Closed")');
        this.cancelledCheckbox = this.modalContainer.locator('div.sc-hTEpIc.fqvlOP:has-text("Cancelled")'); 
    }
    /**
     * Checks if the filter modal is currently visible.
     */
    async isVisible(): Promise<boolean> {
        return await this.modalContainer.isVisible();
    }

    /**
     * Clicks the save button within the filter modal.
     */
    async clickSaveButton(): Promise<void> {
        await expect(this.saveButton).toBeVisible();
        await this.saveButton.click();
        await expect(this.modalContainer).not.toBeVisible(); // Wait for the modal to close
    }

    /**
     * Clicks the 'Active' filter checkbox.
     */
    async clickActiveCheckbox(): Promise<void> {
        await expect(this.activeCheckbox).toBeVisible();
        await this.activeCheckbox.click();
    }

    /**
     * Clicks the 'Closed' filter checkbox.
     */
    async clickClosedCheckbox(): Promise<void> {
        await expect(this.closedCheckbox).toBeVisible();
        await this.closedCheckbox.click();
    }

    /**
     * Clicks the 'Cancelled' filter checkbox.
     */
    async clickCancelledCheckbox(): Promise<void> {
        await expect(this.cancelledCheckbox).toBeVisible();
        await this.cancelledCheckbox.click();
    }
    
    async isActiveChecked(): Promise<boolean> {
        return await this.activeCheckbox.locator('svg').isVisible();
    }

    /**
     * Checks if the 'Closed' checkbox is visually checked/marked.
     */
    async isClosedChecked(): Promise<boolean> {
        return await this.closedCheckbox.locator('svg').isVisible();
    }

    /**
     * Checks if the 'Cancelled' checkbox is visually checked/marked.
     */
    async isCancelledChecked(): Promise<boolean> {
        return await this.cancelledCheckbox.locator('svg').isVisible();
    }
}