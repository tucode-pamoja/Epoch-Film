import EXIF from 'exif-js'

export interface ImageMetadata {
    location_lat: number | null
    location_lng: number | null
    captured_at: string | null
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve) => {
        // Only process images
        if (!file.type.startsWith('image/')) {
            return resolve({ location_lat: null, location_lng: null, captured_at: null })
        }

        EXIF.getData(file as any, function (this: any) {
            const lat = EXIF.getTag(this, 'GPSLatitude')
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef')
            const lng = EXIF.getTag(this, 'GPSLongitude')
            const lngRef = EXIF.getTag(this, 'GPSLongitudeRef')
            const dateTime = EXIF.getTag(this, 'DateTimeOriginal')

            const convertDMSToDD = (dms: number[], ref: string) => {
                if (!dms || dms.length < 3) return null
                let dd = dms[0] + dms[1] / 60 + dms[2] / 3600
                if (ref === 'S' || ref === 'W') dd = dd * -1
                return dd
            }

            const parseExifDate = (dateStr: string) => {
                if (!dateStr) return null
                // EXIF date format: "YYYY:MM:DD HH:MM:SS"
                const [date, time] = dateStr.split(' ')
                const [year, month, day] = date.split(':')
                const [hour, minute, second] = time.split(':')
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hour),
                    parseInt(minute),
                    parseInt(second)
                ).toISOString()
            }

            resolve({
                location_lat: lat ? convertDMSToDD(lat, latRef) : null,
                location_lng: lng ? convertDMSToDD(lng, lngRef) : null,
                captured_at: dateTime ? parseExifDate(dateTime) : null,
            })
        })
    })
}
