import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';

export interface ImageMetadata {
    date?: string;
    location?: string;
    description?: string;
}

/**
 * Extracts metadata from an image and generates a cinematic description.
 */
export async function extractCinematicMetadata(asset: ImagePicker.ImagePickerAsset): Promise<ImageMetadata> {
    const metadata: ImageMetadata = {};

    // Basic extraction from ImagePicker asset
    if (asset.exif) {
        // Date handling
        const dateTime = asset.exif.DateTimeOriginal || asset.exif.DateTime;
        if (dateTime) {
            // EXIF dates are usually "YYYY:MM:DD HH:MM:SS"
            const parts = dateTime.split(/[: ]/);
            if (parts.length >= 3) {
                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                metadata.date = format(date, 'yyyy년 M월 d일');
            }
        }

        // Location handling (simplified)
        if (asset.exif.GPSLatitude && asset.exif.GPSLongitude) {
            metadata.location = `${asset.exif.GPSLatitude.toFixed(4)}, ${asset.exif.GPSLongitude.toFixed(4)}`;
        }
    }

    // fallback to current date if metadata missing
    if (!metadata.date) {
        metadata.date = format(new Date(), 'yyyy년 M월 d일');
    }

    return metadata;
}

/**
 * Generates an 'Auto-Narration' (Screenplay) based on metadata.
 */
export function generateAutoNarration(metadata: ImageMetadata, category: string = '인생'): string {
    const timePrompt = metadata.date ? `${metadata.date}의 어느 순간, ` : '';
    const locPrompt = metadata.location ? `${metadata.location} 근처에서 ` : '';

    return `[${category.toUpperCase()}]\n${timePrompt}${locPrompt}우리는 소중한 장면을 필름에 담았다. 이 기록은 시간이 흘러 찬란한 고전이 될 것이다.`;
}
