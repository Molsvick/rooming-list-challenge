import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { FilterModal } from './filterModal';

export class RoomingListPage extends BasePage {
  // Page Elements
  readonly pageTitleElement: Locator;
  readonly searchInput: Locator;
  readonly filtersButton: Locator;
  readonly noResultsMessage: Locator;
  readonly eventCards: Locator;
  readonly eventGroups: Locator;
  readonly horizontalScrollNextButton: Locator;

  // Page Object for the filter modal
  readonly filterModal: FilterModal;

  constructor(page: Page) {
    super(page);

    this.pageTitleElement = page.locator('h1.sc-igQrDQ.eXysET');
    this.searchInput = page.locator('input.sc-gjZUHa.fhNaUA');
    this.filtersButton = page.locator('button.sc-hlDTgW.dusTar');
    this.noResultsMessage = page.locator('text="No rooming lists found"');
    this.eventCards = page.locator('.sc-fPyrPm .sc-gGarWV.jcCSKd');
    this.eventGroups = page.locator('.sc-kiZvlW.etBHAC');
    this.horizontalScrollNextButton = page.locator('.lePLvk .sc-gZEilz.jwPxOi, .dqnWDz .sc-gZEilz.jwPxOi').first();

    this.filterModal = new FilterModal(page);
  }

  async searchFor(text: string): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(500);
  }

  getEventEntry(rfpName: string): Locator {
    return this.page.locator(`.sc-lpbaSe.guyUPL:has-text("${rfpName}")`).first();
  }

  /**
   * Clicks the 'Filters' button to open the filter modal.
   */
  async openFiltersModal(): Promise<void> {
    await expect(this.filtersButton).toBeEnabled(); 
    await this.filtersButton.click();
    await expect(this.filterModal.modalContainer).toBeVisible();
  }

  /**
   * Performs a horizontal scroll action using the next button.
   */
  async scrollEventsHorizontally(): Promise<void> {
    await expect(this.horizontalScrollNextButton).toBeVisible();
    await this.horizontalScrollNextButton.click();
    await this.page.waitForTimeout(500); // Wait for scroll animation
  }

  /**
   * Retrieves all visible event cards on the page.
   */
  async getAllVisibleEventCards(): Promise<Locator[]> {
    return await this.eventCards.all();
  }

  async getCardRFPName(cardLocator: Locator): Promise<string> {
    const rawName = await cardLocator.locator('.sc-lpbaSe.guyUPL').textContent();
    return this.cleanEventName(rawName); 
  }


  async getCardStatus(cardLocator: Locator): Promise<string | null> {
    const statusElement = cardLocator.locator('[status]');
    await expect(statusElement).toBeVisible();
    return (await statusElement.textContent())?.trim() || null;
  }

  /**
   * Gets the month text from a card's cut-off date.
   */
  async getCardCutOffMonth(cardLocator: Locator): Promise<string | null> {
    const monthElement = cardLocator.locator('.sc-fpgwy.jDIySe div');
    await expect(monthElement).toBeVisible();
    return (await monthElement.textContent())?.trim() || null;
  }

  /**
   * Gets the day text from a card's cut-off date.
   */
  async getCardCutOffDay(cardLocator: Locator): Promise<string | null> {
    const dayElement = cardLocator.locator('.sc-cNFqVt.fkZjea div');
    await expect(dayElement).toBeVisible();
    return (await dayElement.textContent())?.trim() || null;
  }


  async getBookingItemDetails(bookingItem: Locator): Promise<{ phone: string, hotelId: string, checkIn: string, checkOut: string }> {
    const details: { [key: string]: string } = {};
    const detailElements = await bookingItem.locator('div:has(span.sc-fbguzk.exukee)').all();
    const detailLabels = ['Phone', 'Hotel ID', 'Check-in', 'Check-out'];

    for (let j = 0; j < detailElements.length; j++) {
      const detailDiv = detailElements[j];
      const fullText = await detailDiv.textContent();
      const labelSpan = detailDiv.locator('span.sc-fbguzk.exukee');
      const labelText = await labelSpan.textContent();
      const actualValue = fullText?.replace(labelText || '', '').trim() || '[Empty Value]';

      // Map labels to keys for the returned object
      if (detailLabels[j] === 'Phone') details.phone = actualValue;
      if (detailLabels[j] === 'Hotel ID') details.hotelId = actualValue;
      if (detailLabels[j] === 'Check-in') details.checkIn = actualValue;
      if (detailLabels[j] === 'Check-out') details.checkOut = actualValue;
    }
    return details as { phone: string, hotelId: string, checkIn: string, checkOut: string };
  }
}
