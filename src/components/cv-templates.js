import { StyleSheet } from '@react-pdf/renderer';

function getContrastColor(hex) {
    if (!hex) return '#FFFFFF';
    let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    if (cleanHex.length !== 6) return '#FFFFFF';
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 140 ? '#2d3748' : '#FFFFFF';
}

function isColorLight(hex) {
    if (!hex) return false;
    let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 180;
}


export const createCvStyles = (options) => {
    const { 
        primaryColor, template, photoShape, 
        summaryLength, experienceCount, educationCount, skillsCount,
        projectsCount, languagesCount, certificationsCount
    } = options || {};
    
    const safePrimaryColor = primaryColor || '#2d3748';
    const contrastColor = getContrastColor(safePrimaryColor);
    const isPrimaryColorLight = isColorLight(safePrimaryColor);
    const readablePrimaryAsText = isPrimaryColorLight ? '#2d3748' : safePrimaryColor;

    const contentScore = 
        (experienceCount * 3) + (educationCount * 2) + (projectsCount * 2.5) +
        (skillsCount * 0.5) + (languagesCount * 1) + (certificationsCount * 1) +
        (summaryLength / 100);
    const isCompact = contentScore > 18;
    const isSuperCompact = contentScore > 25;
    let baseFontSize = 9.5, sectionMargin = 13, itemMargin = 9, lineHeight = 1.35;
    if (isSuperCompact) {
        baseFontSize = 8.5; sectionMargin = 9; itemMargin = 6; lineHeight = 1.25;
    } else if (isCompact) {
        baseFontSize = 9; sectionMargin = 11; itemMargin = 7; lineHeight = 1.3;
    }
    
    const commonStyles = {
        name: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins', color: '#1a202c' },
        jobTitle: { fontSize: 13, marginBottom: 12, fontFamily: 'Poppins' },
        sectionTitle: { fontSize: 13, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 3 },
        entryTitle: { fontSize: baseFontSize + 1.5, fontWeight: 'bold', fontFamily: 'Poppins', textDecoration: 'none', color: '#1a202c' },
        entrySub: { fontSize: baseFontSize - 0.5, marginTop: 1 },
        description: { fontSize: baseFontSize, marginTop: 3, textAlign: 'justify', lineHeight: lineHeight },
        section: { marginBottom: sectionMargin },
        itemContainer: { marginBottom: itemMargin },
        languageName: { fontSize: baseFontSize, fontFamily: 'Poppins', marginBottom: 2 },
        languageLevelBar: { width: '80%', height: 4, borderRadius: 2, marginTop: 2, backgroundColor: '#e2e8f0' },
        languageLevelProgress: { height: '100%', borderRadius: 2 },
        skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
        skillTag: { fontSize: baseFontSize - 1, backgroundColor: '#edf2f7', color: '#2d3748', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginRight: 5, marginBottom: 5 },
        linkItem: { fontSize: baseFontSize, textDecoration: 'none', marginBottom: 3, }
    };
    
    const photoStyle = {
        width: 100,
        height: 100,
        objectFit: 'cover',
        borderRadius: photoShape === 'round' ? 999 : 2, 
    };

    switch (template) {
        case 'moderno':
            return StyleSheet.create({
                ...commonStyles,
                page: { flexDirection: 'row', backgroundColor: '#fff', fontFamily: 'Poppins', fontSize: baseFontSize },
                leftColumnContent: { width: '35%', padding: 20, color: contrastColor },
                rightColumnContent: { width: '65%', padding: 20, color: '#2d3748' },
                fixedBackgroundLeft: {
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '35%',
                    backgroundColor: safePrimaryColor,
                },
                photo: { ...photoStyle, marginBottom: 15, alignSelf: 'center' },
                headerRight: { marginBottom: 15, color: readablePrimaryAsText },
                sectionTitle: { ...commonStyles.sectionTitle, color: readablePrimaryAsText, borderBottomColor: readablePrimaryAsText },
                sectionTitleLeft: { ...commonStyles.sectionTitle, color: contrastColor, borderBottomColor: contrastColor },
                contactItem: { marginBottom: 6, flexDirection: 'row', alignItems: 'center', fontSize: baseFontSize, color: contrastColor },
                languageLevelProgress: { ...commonStyles.languageLevelProgress, backgroundColor: contrastColor },
                linkItem: { ...commonStyles.linkItem, color: contrastColor },
                languageName: { ...commonStyles.languageName, color: contrastColor },
            });
        
        case 'classico':
            return StyleSheet.create({
                ...commonStyles,
                page: { padding: 30, fontFamily: 'Poppins', fontSize: baseFontSize, backgroundColor: '#fff', color: '#2d3748' },
                header: { textAlign: 'center', marginBottom: 20, borderBottomWidth: 2, paddingBottom: 15, borderColor: '#eee' },
                photo: { ...photoStyle, width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
                sectionTitle: { ...commonStyles.sectionTitle, color: readablePrimaryAsText, borderBottomColor: readablePrimaryAsText },
                languageLevelProgress: { ...commonStyles.languageLevelProgress, backgroundColor: readablePrimaryAsText },
                linkItem: { ...commonStyles.linkItem, color: readablePrimaryAsText },
            });

        case 'criativo':
            return StyleSheet.create({
                ...commonStyles,
                page: { backgroundColor: '#f3f4f6', fontFamily: 'Poppins', fontSize: baseFontSize },
                headerContainer: { backgroundColor: safePrimaryColor, padding: 30, paddingTop: 40, flexDirection: 'row', alignItems: 'center' },
                headerText: { flex: 1, color: contrastColor, paddingLeft: 40 },
                name: { ...commonStyles.name, color: contrastColor },
                jobTitle: { ...commonStyles.jobTitle, color: contrastColor, opacity: 0.9 },
                photoContainer: { width: 100 },
                photo: { ...photoStyle, borderWidth: 4, borderColor: '#fff' },
                mainContent: { flexDirection: 'row', padding: 20 },
                leftColumn: { width: '65%', paddingRight: 15 },
                rightColumn: { width: '35%', paddingLeft: 15 },
                sectionTitle: { ...commonStyles.sectionTitle, color: readablePrimaryAsText, borderBottomColor: readablePrimaryAsText },
                languageLevelProgress: { ...commonStyles.languageLevelProgress, backgroundColor: readablePrimaryAsText },
                linkItem: { ...commonStyles.linkItem, color: readablePrimaryAsText },
            });

        case 'executivo':
             return StyleSheet.create({
                ...commonStyles,
                page: { flexDirection: 'row', backgroundColor: '#fff', fontFamily: 'Poppins', fontSize: baseFontSize },
                leftColumn: { width: '65%', padding: 25 },
                rightColumn: { width: '35%', backgroundColor: '#f1f1f1', padding: 25 },
                header: { marginBottom: 20 },
                name: { ...commonStyles.name, fontSize: 32, color: readablePrimaryAsText },
                photo: { ...photoStyle, width: 80, height: 80, marginBottom: 15 },
                sectionTitle: { ...commonStyles.sectionTitle, color: readablePrimaryAsText, borderBottomColor: '#ddd', paddingBottom: 3 },
                contactInfo: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, fontSize: baseFontSize - 1 },
                contactItem: { marginRight: 10 },
                languageLevelProgress: { ...commonStyles.languageLevelProgress, backgroundColor: readablePrimaryAsText },
                linkItem: { ...commonStyles.linkItem, color: readablePrimaryAsText },
             });

        default:
            return StyleSheet.create({
                page: { padding: 30 },
                fallback: { fontSize: 12, color: 'red', fontFamily: 'Poppins' },
            });
    }
};