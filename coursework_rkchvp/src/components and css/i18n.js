import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            
            home: "Home",
            image: "Ad banner maker",
            video: "Video ad maker",
            welcome: "Welcome to our website!",
            addText: "Add Text",
            addImage: "Add Image",
            changeBg: "Change Background",
            saveB: "Save Canvas",
            saveV: "Save Video",
            closeBB: "Hide Brand Book",
            openBB: "Show Brand Book",
            closeTL: "Close Template Library",
            openTL: "Open Template Library",
            selectFormat: "Select Format",
            saveButtonB: "Save",
            closeButton: "Close",
            chooseBgColor: "Choose Background Color",
            chooseBgImage: "Choose Background Image",
            enterBgImageURL: "Enter Background Image URL",
            resetBg: "Reset Background",
            uploadImage: "Upload image",
            enterImageURL: "Or enter image URL",
            editText: "Edit Text",
            inputText: "Text",
            colorText: "Text color",
            bgColorText: "Text background color",
            bgTransText: "Text background transparency",
            fontSizeText: "Font size",
            alignText: "Alignment",
        }
    },
    ru: {
        translation: {
            
            home: "Главная",
            image: "Конструктор баннеров",
            video: "Конструктор видеороликов",
            welcome: "Добро пожаловать на наш сайт!",
            addText: "Добавить Текст",
            addImage: "Добавить Изображение",
            changeBg: "Изменить Фон",
            saveB: "Сохранить Холст",
            saveV: "Сохранить Видео",
            closeBB: "Скрыть Брендбук",
            openBB: "Показать Брендбук",
            closeTL: "Закрыть Библиотеку Шаблонов",
            openTL: "Открыть Библиотеку Шаблонов",
            selectFormat: "Выбирете Формат",
            saveButtonB: "Сохранить",
            closeButton: "Закрыть",
            chooseBgColor: "Выбирете цвет фона",
            chooseBgImage: "Выбирете изображение фона",
            enterBgImageURL: "Введите URL изображения для фона",
            resetBg: "Востановить фон",
            uploadImage: "Добавьте изображение",
            enterImageURL: "Или введите URL изображения",
            editText: "Редактировать Текст",
            inputText: "Текст",
            colorText: "Цвет текста",
            bgColorText: "Цвет фона текста",
            bgTransText: "Прозрачность фона текста",
            fontSizeText: "Размер шрифта",
            alignText: "Выравнивание",
        }
    },
    de: {
        translation: {
            
            home: "Startseite",
            image: "Banner-Werbemacher",
            video: "Video-Werbemacher",
            welcome: "Willkommen auf unserer Webseite!",
            addText: "Text hinzufügen",
            addImage: "Bild hinzufügen",
            changeBg: "Hintergrund ändern",
            saveB: "Leinwand speichern",
            saveV: "Video speichern",
            closeBB: "Kleie-Buch anzeigen",
            openBB: "Kleie-Buch ausblenden",
            closeTL: "Vorlagenbibliothek schließen",
            openTL: "Vorlagenbibliothek öffnen",
            selectFormat: "Format auswählen",
            saveButtonB: "Speichern",
            closeButton: "Schließen",
            chooseBgColor: "Hintergrundfarbe wählen",
            chooseBgImage: "Hintergrundbild auswählen",
            enterBgImageURL: "URL des Hintergrundbilds eingeben",
            resetBg: "Hintergrund zurücksetzen",
            uploadImage: "Bild hochladen",
            enterImageURL: "Oder Bild-URL eingeben",
            editText: "Text bearbeiten",
            inputText: "Text",
            colorText: "Textfarbe",
            bgColorText: "Texthintergrundfarbe",
            bgTransText: "Texthintergrundtransparenz",
            fontSizeText: "Schriftgröße",
            alignText: "Ausrichtung",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes output
        }
    });

export default i18n;
