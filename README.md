# STOCKMACHINE

STOCKMACHINE is a multilingual inventory management application designed to help users efficiently manage products, categories, racks, and shelves. The application supports multiple languages, including English, Spanish, French, Japanese, and Russian.

## Features

### Multilingual Support
STOCKMACHINE provides localization for the following languages:
- **English (en)**
- **Spanish (es)**
- **French (fr)**
- **Japanese (ja)**
- **Russian (ru)**

### Navigation
The application includes navigation for:
- Products
- Categories
- Racks
- Shelves

### Actions
Users can perform the following actions:
- Create
- Edit
- Delete
- Save
- Cancel
- Close
- Confirm
- Import
- Export stock

### Modals
The application includes modals for:
- Delete confirmation
- Import data (with file selection)

### Messages
Feedback messages are provided for success and error scenarios:
- **Success**: Created, updated, deleted, imported, and exported records.
- **Error**: Issues during creation, update, deletion, import, and export.

### Common Features
- Search functionality
- Actions menu

### Tables
Management tables are available for:
- **Products**: Includes columns for name, category, shelve, rack, quantity, and description.
- **Categories**: Includes columns for ID, name, and description.
- **Shelves**: Includes columns for ID and name.
- **Racks**: Includes columns for ID, name, and shelve.

### Forms
Forms include:
- Labels for importing data and managing products, categories, shelves, and racks.
- Placeholders for user input (e.g., name, description, quantity, price, category, shelve, rack).
- Validation messages for required fields.

## Localization Files

The localization files are located in the `src/locales` directory and include:
- `en.js` for English
- `es.js` for Spanish
- `fr.js` for French
- `ja.js` for Japanese
- `ru.js` for Russian

Each file contains translations for the application's UI elements, messages, and forms.

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   
   
Navigate to the project directory:
   ```bash
   cd ps-electron
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
Start the application:
```bash
npm start
