import logger from '@/resources/logger';

const COMMON_FORMATTING_MISTAKES = ['now-'];

export const convertDateTagToDate = (dateTag: string, delimiter = '|'): Date | null => {
    const now = new Date();

    let formattedDateTag = dateTag;

    for (const mistake of COMMON_FORMATTING_MISTAKES) {
        if (dateTag.startsWith(mistake)) {
            formattedDateTag = dateTag.replace(mistake, '');
        }
    }

    if (formattedDateTag === 'now') {
        return now;
    }

    const [quantity, unit] = formattedDateTag.split(delimiter) as [
        number,
        'Y' | 'M' | 'W' | 'D' | 'H' | 'm' | 's',
    ];

    switch (unit) {
        case 'Y':
            return new Date(
                now.getFullYear() - quantity,
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );
        case 'M':
            return new Date(
                now.getFullYear(),
                now.getMonth() - quantity,
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );
        case 'W':
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - quantity * 7,
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );
        case 'D':
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - quantity,
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );
        case 'H':
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours() - quantity,
                now.getMinutes(),
                now.getSeconds()
            );
        case 'm':
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes() - quantity,
                now.getSeconds()
            );
        case 's':
            return new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds() - quantity
            );
        default:
            void logger.error(`Invalid date unit: ${unit}`, {
                dateTag,
                formattedDateTag,
                quantity,
            });
            return null;
    }
};

export const convertDateToTimestamp = (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
};

export const formatDateToHumanReadable = (date: Date | number): string => {
    if (typeof date === 'number') {
        date = new Date(date * 1000);
    }

    return date.toDateString();
};
