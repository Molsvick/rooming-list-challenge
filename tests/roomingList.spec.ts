import { test, expect } from '@playwright/test';
import { RoomingListPage } from '../e2e/pages/roomingListPage'; 
import { FilterModal } from '../e2e/pages/filterModal';

test.describe('Rooming List Page Tests', () => {
    let roomingListPage: RoomingListPage;
    let filterModal: FilterModal;

    test.beforeEach(async ({ page }) => {
        roomingListPage = new RoomingListPage(page);
        filterModal = new FilterModal(page);
        await roomingListPage.goto();
    });
    
    test('T01-Verify that the Search input is displayed', async () => {
        // Expect the search input to be visible.
        await expect(roomingListPage.searchInput).toBeVisible();
    });

    test('T02-Verify that a user can type text into the Search input', async () => {
        const testSearchText = 'Team';
        await roomingListPage.searchFor(testSearchText);
        await expect(roomingListPage.searchInput).toHaveValue(testSearchText);
    });

    test('T03-Verify that searching filters the list of events based on input', async () => {
        const headlineEntry = roomingListPage.getEventEntry('[ACL Headliner Suites]');
        const ultraCrewEntry = roomingListPage.getEventEntry('[Ultra Crew Housing]');

        // 1. Verify both items are visible initially.
        await expect(headlineEntry).toBeVisible();
        await expect(ultraCrewEntry).toBeVisible();

        // 2. Type a search term that only matches one item.
        await roomingListPage.searchFor('Ultra Crew Housing'); // Search term without brackets

        // 3. Assert that the list is filtered correctly.
        await expect(headlineEntry).toBeHidden();
        await expect(ultraCrewEntry).toBeVisible();
    });

    test(`T04-Verify that if no matching event is found, a 'no results' message appears`, async () => {
        const djEntry = roomingListPage.getEventEntry('[Ultra DJ Accommodations]'); 
        const vipExperienceEntry = roomingListPage.getEventEntry('[Ultra VIP Experience]');

        // 1. Verify both items are visible initially.
        await expect(djEntry).toBeVisible();
        await expect(vipExperienceEntry).toBeVisible();

        // 2. Type a search term that will not match any event.
        await roomingListPage.searchFor('zzzzzzzz');

        // 3. Assert that a "No rooming lists found" message is displayed and original items are hidden.
        await expect(roomingListPage.noResultsMessage).toBeVisible();
        await expect(djEntry).toBeHidden();
        await expect(vipExperienceEntry).toBeHidden();
    });

    test('T05-Verify that the Filters button is displayed', async () => {
        // Expect the Filters button to be visible.
        await expect(roomingListPage.filtersButton).toBeVisible();
    });

    test('T06-Verify that clicking the Filters button opens the filter dropdown', async () => {
        await roomingListPage.openFiltersModal();
        // Verify that each filter option is visible.
        expect(await filterModal.isActiveChecked()).toBe(false);
        expect(await filterModal.isClosedChecked()).toBe(true);
        expect(await filterModal.isCancelledChecked()).toBe(false);
    });

    test(`T07-Verify that the filter options are 'Active', 'Closed', and 'Cancelled'`, async () => {
        // 1. Click the Filters button to open the dropdown.
        await roomingListPage.openFiltersModal();

        // 2. Verify that each filter option is visible.
        expect(await filterModal.activeCheckbox).toBeVisible();
        expect(await filterModal.closedCheckbox).toBeVisible();
        expect(await filterModal.cancelledCheckbox).toBeVisible();

        // And verify their default checked states
        expect(await filterModal.isActiveChecked()).toBe(false);
        expect(await filterModal.isClosedChecked()).toBe(true);
        expect(await filterModal.isCancelledChecked()).toBe(false);
    });

    test(`T08-Verify that selecting a filter option filters the event list correctly`, async () => {
        // 1. Click on the main 'Filters' button to open the modal
        await roomingListPage.openFiltersModal();

        // 2. Disable the default 'Closed' option by clicking it and enable the 'Cancelled' option.
        await filterModal.clickClosedCheckbox();
        await filterModal.clickCancelledCheckbox();

        // 3. Click the 'Save' button inside the modal to apply the filters
        await filterModal.clickSaveButton(); // Use POM method

        // 4. Verify that only events with status "Cancelled" are visible
        const visibleEventCards = await roomingListPage.getAllVisibleEventCards();
        expect(visibleEventCards.length).toBeGreaterThanOrEqual(0);

        for (const card of visibleEventCards) {
            const statusText = await roomingListPage.getCardStatus(card);
            expect(statusText).toBe('Cancelled');
        }
    });

    test(`T09-Verify that the 'Save' button applies the selected filter`, async () => {
        // Initial setup to get locators
        const activeEntry = roomingListPage.getEventEntry('[Ultra DJ Accommodations]');
        const closedEntry = roomingListPage.getEventEntry('[Ultra Artist Management]');
        const canceledEntry = roomingListPage.getEventEntry('[Ultra Crew Housing]');

        // 1. Open filters modal
        await roomingListPage.openFiltersModal();

        // 2. Uncheck 'Closed' and check 'Active', then save.
        await filterModal.clickClosedCheckbox();
        await filterModal.clickActiveCheckbox(); // Click 'Active' to check it
        await filterModal.clickSaveButton();

        // 3. Assert that only the 'Active' event remains visible.
        await roomingListPage.searchFor('DJ');
        await expect(activeEntry).toBeVisible();
        await expect(closedEntry).toBeHidden();
        await expect(canceledEntry).toBeHidden();
    });

    test(`T10-Verify that after applying a filter, the selected filter persists if the Filters dropdown is reopened`, async () => {
        // 1. Open filters modal
        await roomingListPage.openFiltersModal();

        // 2. Uncheck 'Closed' and check 'Cancelled', then save.
        await filterModal.clickClosedCheckbox();
        await filterModal.clickCancelledCheckbox(); // Click 'Cancelled' to check it
        await filterModal.clickSaveButton();

        // 3. Reopen filters and verify that only 'Cancelled' is checked.
        await roomingListPage.openFiltersModal();
        expect(await filterModal.isActiveChecked()).toBe(false);
        expect(await filterModal.isClosedChecked()).toBe(false);
        expect(await filterModal.isCancelledChecked()).toBe(true);
    });

    test(`T11-Verify that multiple filters can be selected/deselected`, async () => {
        // 1. Open Filter modal
        await roomingListPage.openFiltersModal();

        // 2. Uncheck 'Closed' and check 'Active' and 'Cancelled', then save.
        await filterModal.clickClosedCheckbox();
        await filterModal.clickActiveCheckbox(); // Click 'Active' to check it
        await filterModal.clickCancelledCheckbox(); // Click 'Cancelled' to check it

        await filterModal.clickSaveButton();
    });

    test('T12-Verify that event cards are displayed grouped by event names', async ({ request }) => {
        // We make a GET request to the API, asking it to sort by 'rfpName'.
        const response = await request.get('http://localhost:4003/api/rooming-lists?sortBy=rfpName&sortOrder=ASC');

        // 1. We verify that the response was successful (code 200).
        await expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        // 2. We analyze the JSON response.
        const responseBody = await response.json();
        console.log(responseBody);

        // 3. We extract the 'rfpName' names into a new array.
        const rfpNames = responseBody.map((item: { rfpName: string }) => item.rfpName);

        // 4. Create a copy of the array of names and sort it alphabetically.
        const sortedRfpNames = [...rfpNames].sort((a, b) => a.localeCompare(b));
        console.log(sortedRfpNames);

        // 5. We verify that the original API array was already sorted,
        expect(rfpNames).toEqual(sortedRfpNames);
    });

    test('T13-Verify that each event card displays the RFP name, Agreement type, and Cut-Off Date', async () => {
        // 1. Locate all event cards
        const eventCards = await roomingListPage.getAllVisibleEventCards();
        // Ensure event cards were found
        expect(eventCards.length).toBeGreaterThan(0);

        // 2. Iterate over each event card to verify the information
        for (const card of eventCards) {
            // Find the RFP name
            const rfpName = card.locator('.sc-lpbaSe.guyUPL');
            await expect(rfpName).toBeVisible();
            await expect(rfpName).not.toBeEmpty();

            // Locate the agreement type
            const agreementType = card.locator('.sc-bxjEGZ.coxujC');
            await expect(agreementType).toBeVisible();
            await expect(agreementType).not.toBeEmpty();

            // Find the cut-off date elements
            const cutOffDateContainer = card.locator('.sc-iSqusk.bWRJjf');
            await expect(cutOffDateContainer).toBeVisible();

            const month = card.locator('.sc-fpgwy.jDIySe div');
            const day = card.locator('.sc-cNFqVt.fkZjea div'); 

            await expect(month).toBeVisible();
            await expect(month).not.toBeEmpty();
            await expect(day).toBeVisible();
            await expect(day).not.toBeEmpty();
        }
    });

    test('T14-Verify that the "View Bookings" button is displayed on each event card', async () => {
        // 1. Locate all event cards
        const eventCards = await roomingListPage.getAllVisibleEventCards();
        // Ensure event cards were found
        expect(eventCards.length).toBeGreaterThan(0);

        // 2. Iterate over each event card to check for the presence of the "View Bookings" button
        for (const card of eventCards) {
            const viewBookingsButton = card.locator('.sc-kRZjnb.uEwrw');
            await expect(viewBookingsButton).toBeVisible();
            await expect(viewBookingsButton).toContainText('View Bookings');
        }
    });

    test('T15-Verify that the "View Bookings" button displays the correct number of bookings', async ({ page }) => {
        // Locate all event cards
        const eventCards = await roomingListPage.getAllVisibleEventCards();
        expect(eventCards.length).toBeGreaterThan(0);

        // Iterate over each event card
        for (let i = 0; i < eventCards.length; i++) {
            const card = roomingListPage.eventCards.nth(i);
            // Extract the event name for better logging
            const eventName = await roomingListPage.getCardRFPName(card);

            // Locate the 'View Bookings' button
            const viewBookingsButton = card.locator('.sc-kRZjnb.uEwrw');
            await expect(viewBookingsButton).toBeVisible();

            // Extract the number of bookings from the button text
            const buttonText = await viewBookingsButton.textContent();
            const match = buttonText?.match(/\((\d+)\)/);
            let expectedBookingsCount = 0;

            if (match && match[1]) {
                expectedBookingsCount = parseInt(match[1], 10);
            }

            // Click the 'View Bookings' button to open the modal
            await viewBookingsButton.click();

            // Wait for the modal to be visible
            const bookingModal = page.locator('.dkcvGm'); // This modal could also be its own Page Object
            await expect(bookingModal).toBeVisible();

            // Count the actual number of booking items within the modal
            const actualBookingItems = await bookingModal.locator('.dxQRDf').all();
            const actualBookingsCount = actualBookingItems.length;

            // Verify that the number of reservations matches
            expect(actualBookingsCount).toBe(expectedBookingsCount);

            // Close the modal
            const closeButton = bookingModal.locator('.OuOig');
            await expect(closeButton).toBeVisible();
            await closeButton.click();
            await expect(bookingModal).not.toBeVisible();
        }
    });

    test('T16-Verify that clicking on the "View Bookings" button opens the correct booking details', async ({ page }) => {
        // Locate all event cards
        const eventCards = await roomingListPage.getAllVisibleEventCards();
        expect(eventCards.length).toBeGreaterThan(0);

        // Iterate over each event card
        for (let i = 0; i < eventCards.length; i++) {
            // Re-locating the card for robustness
            const card = roomingListPage.eventCards.nth(i);

            // Extract the event name for better logging
            const eventName = await roomingListPage.getCardRFPName(card);

            // Locate the 'View Bookings' button and click it
            const viewBookingsButton = card.locator('.sc-kRZjnb.uEwrw');
            await expect(viewBookingsButton).toBeVisible();
            await viewBookingsButton.click();

            // Wait for the modal to be visible
            const bookingModal = page.locator('.dkcvGm'); // This modal could also be its own Page Object
            await expect(bookingModal).toBeVisible();

            // Count the number of reservation items within the modal
            const bookingItems = await bookingModal.locator('.dxQRDf').all();
            expect(bookingItems.length).toBeGreaterThanOrEqual(0);

            // Iterate over each reservation item to verify its details
            for (const bookingItem of bookingItems) {
                // Verify the person's name
                const personName = bookingItem.locator('.sc-gAqISa.clEiRj');
                await expect(personName).toBeVisible();
                await expect(personName).not.toBeEmpty();

                // Check details (Phone, Hotel ID, Check-in, Check-out) using the POM method
                const details = await roomingListPage.getBookingItemDetails(bookingItem);
                expect(details.phone).not.toBe('[Empty Value]');
                expect(details.hotelId).not.toBe('[Empty Value]');
                expect(details.checkIn).not.toBe('[Empty Value]');
                expect(details.checkOut).not.toBe('[Empty Value]');
            }

            // Close the modal
            const closeButton = bookingModal.locator('.OuOig');
            await expect(closeButton).toBeVisible();
            await closeButton.click();
            await expect(bookingModal).not.toBeVisible();
        }
    });

    test('T17-Verify that event cards can be scrolled horizontally if there are many', async ({ page }) => {
        // Locate the main container of an event section.
        const eventSectionContainer = roomingListPage.eventGroups.first();
        await expect(eventSectionContainer).toBeVisible();

        // Locate the right navigation button
        const nextButton = roomingListPage.horizontalScrollNextButton;
        await expect(nextButton).toBeVisible();

        // Locate the actual scroll container for event cards within this section
        const scrollContainer = eventSectionContainer.locator('.sc-bpuAaX.jOKtSV');
        await expect(scrollContainer).toBeVisible();

        // Verify if horizontal scrolling is actually necessary
        const scrollWidth = await scrollContainer.evaluate(node => node.scrollWidth);
        const clientWidth = await scrollContainer.evaluate(node => node.clientWidth);

        if (scrollWidth <= clientWidth + 5 || !(await nextButton.isVisible())) {
            test.skip('Not enough cards to enable horizontal scrolling, or navigation button is not active.', () => { });
            return;
        }

        // Verify initial scroll position
        const initialScrollLeft = await scrollContainer.evaluate(node => node.scrollLeft);

        // Click the right navigation button to scroll
        await nextButton.click();
        await page.waitForTimeout(500); // Wait for scroll animation

        // Verify that the scroll position has changed
        const newScrollLeft = await scrollContainer.evaluate(node => node.scrollLeft);
        expect(newScrollLeft).toBeGreaterThan(initialScrollLeft);
    });

    test('T18-Verify that the page title "Rooming List Management: Events" is displayed', async () => {
        // Verify that the title element is visible and its text matches the expected title
        await expect(roomingListPage.pageTitleElement).toBeVisible();
        expect(await roomingListPage.pageTitleElement.textContent()).toBe('Rooming List Management: Events');
    });

    test('T19-Verify that the filters dropdown is correctly positioned under the Filters button', async () => {
        // Get the bounding box of the Filters button before opening the modal
        const filtersButtonBox = await roomingListPage.filtersButton.boundingBox();
        expect(filtersButtonBox).not.toBeNull();

        // Click the 'Filters' button to open the modal/dropdown
        await roomingListPage.openFiltersModal();

        // Get the bounding box of the filter dropdown
        const filterDropdownBox = await filterModal.modalContainer.boundingBox();
        expect(filterDropdownBox).not.toBeNull();

        // Check the positioning
        const expectedDropdownY = filtersButtonBox!.y + filtersButtonBox!.height;
        const actualDropdownY = filterDropdownBox!.y;

        expect(actualDropdownY).toBeCloseTo(expectedDropdownY, 5);

        // Close the modal/dropdown to clear the page state
        await filterModal.clickSaveButton(); 
    });

    test('T20-Verify that each event group has a clear visual separator', async () => {
        // Locate all event group containers
        const eventGroups = await roomingListPage.eventGroups.all();
        expect(eventGroups.length).toBeGreaterThan(0);

        // Iterate over each event group to check their separators
        for (let i = 0; i < eventGroups.length; i++) {
            const group = eventGroups[i]; // Get the current group
            // Locate the visual separators within the group title container
            const separators = await group.locator('.sc-kghAKo.iwkhCh').all();
            // Expect there to be 2 separators per group (one on each side of the title)
            expect(separators.length).toBe(2);
            // Verify that each separator is visible
            for (let j = 0; j < separators.length; j++) {
                const separator = separators[j];
                await expect(separator).toBeVisible({ timeout: 5000 });
            }
        }
    });

    test(`T21-Verify the behavior when no events are available`, async () => {
        // 1. Type a search term that will not match any event.
        await roomingListPage.searchFor('zzzzzzzz');

        // 2. Assert that a "No rooming lists found" message is displayed and original items are hidden.
        await expect(roomingListPage.noResultsMessage).toBeVisible();
    });

    test('T22-Verify if search and filters work together', async ({ page }) => {
        await roomingListPage.openFiltersModal();

        // Click save button in filter modal
        await filterModal.clickSaveButton();

        // Initial visibility check of the 'ACL Security Personnel' event after the filter
        const targetEventName = 'ACL Security Personnel';
        const aclSecurityPersonnelCard = roomingListPage.getEventEntry(`[${targetEventName}]`);
        await expect(aclSecurityPersonnelCard).toBeVisible();

        // Enter text in the search bar.
        await expect(roomingListPage.searchInput).toBeVisible();
        await roomingListPage.searchInput.fill(targetEventName);

        // Validate that only the event searched for is listed and its status.
        await page.waitForTimeout(1000)
        const allVisibleEventCardsAfterSearch = await roomingListPage.getAllVisibleEventCards();

        expect(allVisibleEventCardsAfterSearch.length).toBe(1);

        const finalVisibleCard = allVisibleEventCardsAfterSearch[0];
        const cleanedFinalEventName = await roomingListPage.getCardRFPName(finalVisibleCard); 

        const finalEventStatus = await roomingListPage.getCardStatus(finalVisibleCard); 
        // Now we compare the cleaned name with the expected name without brackets.
        await expect(cleanedFinalEventName).toBe(targetEventName);
        expect(finalEventStatus).toBe('Closed');
    });

    test('T23-Verify UI responsiveness', async ({ page }) => {
        // 1. Get the initial viewport size
        const initialViewportSize = page.viewportSize();
        console.log(`Initial viewport size: ${initialViewportSize?.width}x${initialViewportSize?.height}`);

        // Verify that key elements are visible in the initial size
        await expect(roomingListPage.pageTitleElement).toBeVisible();
        await expect(roomingListPage.searchInput).toBeVisible();
        await expect(roomingListPage.filtersButton).toBeVisible();
        await expect(roomingListPage.eventCards.first()).toBeVisible();
        console.log('Key elements visible at initial size.');

        // 2. Resize the window to a tablet size (e.g., 768px width, 1024px height)
        const tabletWidth = 768;
        const tabletHeight = 1024;
        await page.setViewportSize({ width: tabletWidth, height: tabletHeight });
        console.log(`Viewport resized to: ${tabletWidth}x${tabletHeight} (Tablet)`);

        await page.waitForTimeout(1000);

        // 3. Verify that the layout adjusts correctly in tablet size
        // A. Verify that key elements are still visible
        await expect(roomingListPage.pageTitleElement).toBeVisible();
        await expect(roomingListPage.searchInput).toBeVisible();
        await expect(roomingListPage.filtersButton).toBeVisible();
        await expect(roomingListPage.eventCards.first()).toBeVisible();
        console.log('Key elements visible at tablet size.');

        // B. Specific layout verifications for tablet (EXAMPLES - ADAPT THIS TO YOUR UI)
        const searchInputWidth = await roomingListPage.searchInput.evaluate(el => el.clientWidth);
        console.log(`Search input width on tablet: ${searchInputWidth}px`);

        // 4. Resize the window to a mobile size (e.g., 375px width, 667px height)
        const mobileWidth = 375;
        const mobileHeight = 667;
        await page.setViewportSize({ width: mobileWidth, height: mobileHeight });
        console.log(`Viewport resized to: ${mobileWidth}x${mobileHeight} (Mobile)`);

        await page.waitForTimeout(1000);

        // 5. Verify that the layout adjusts correctly in mobile size
        await expect(roomingListPage.pageTitleElement).toBeVisible();
        await expect(roomingListPage.searchInput).toBeVisible();
        await expect(roomingListPage.filtersButton).toBeVisible();
        await expect(roomingListPage.eventCards.first()).toBeVisible();
        console.log('Key elements visible at mobile size.');
    });
});