# Manual Test Checklist

## 1. Routes
- Open `/` and confirm Home dashboard renders.
- Open `/events` and confirm Events list page renders.
- Open `/events/new` and confirm create form renders.
- Open an event details route like `/events/evt-1` and confirm details render.
- Open event edit route `/events/evt-1/edit` and confirm edit form renders.
- Open `/news` and confirm News list page renders.
- Open `/news/new` and confirm create form renders.
- Open a news details route like `/news/news-1` and confirm details render.
- Open news edit route `/news/news-1/edit` and confirm edit form renders.
- Open an invalid route like `/unknown-page` and confirm Not Found page appears.

## 2. localStorage Persistence
- Create at least one event and one news item.
- Refresh the browser tab.
- Confirm created items are still visible.
- Close and reopen browser, then confirm data remains.

## 3. Events CRUD
- Create event: submit valid data and confirm redirect to details page.
- Edit event: change title/category and save, confirm updates appear.
- Delete event from list and from details page, confirm removal.

## 4. News CRUD
- Create news: submit valid data and confirm redirect to details page.
- Edit news: change title/category and save, confirm updates appear.
- Delete news from list and from details page, confirm removal.

## 5. Search and Filter
- On Events list, search by part of title and confirm matching results.
- Search by part of description and confirm matching results.
- Apply category filter and confirm only selected category is shown.
- Combine search + category filter and verify results remain correct.

## 6. Form Validation
- Try submitting Event form with empty required fields.
- Confirm validation errors show for required fields.
- Try submitting News form with empty required fields.
- Confirm validation errors show for required fields.

## 7. Empty States
- Delete all events and confirm empty state message appears on Events page.
- Delete all news and confirm empty state message appears on News page.
- Confirm Home sections show fallback text when no upcoming events/news exist.

## 8. Basic Error Handling
- If browser storage is blocked/full, attempt create/update/delete.
- Confirm user-facing error message appears (no app crash).

## 9. Responsive Layout
- Test on desktop width (>1024px): cards and dashboard layout look correct.
- Test on tablet width (~768px): elements wrap cleanly.
- Test on mobile width (~375px): nav, cards, forms, buttons remain usable.

## 10. Weather API
- Add a valid `VITE_OPENWEATHER_API_KEY` to `.env.local`.
- Open Home page and confirm weather section shows city, temperature, condition, humidity, and icon.
- Temporarily remove/invalid API key and confirm weather error message appears.

## 11. Event Map
- Open an event with coordinates and confirm map + marker appears on Event Details.
- Open Event Edit page and click `Set Location`, then click on map and confirm coordinates update.
- Save event and confirm updated marker position appears on Event Details map.
- Clear location in Event form and confirm Event Details shows missing-coordinates message.
