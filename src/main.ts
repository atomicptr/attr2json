const arraySegmentRegex = /^(.*)\[(\d+)\]$/;

const convertKebabCaseToCamelCase = (segment: string) =>
    segment
        .split("-")
        .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("");

const parseArraySegment = (segment: string) => {
    const match = segment.match(arraySegmentRegex);

    if (!match) {
        return null;
    }

    const parts = [];

    const base = match[1];

    if (base) {
        parts.push(convertKebabCaseToCamelCase(base));
    }

    parts.push(parseInt(match[2]));

    return parts;
};

const parseNumber = (value: string): number | null => {
    const res = parseFloat(value);
    return isNaN(res) ? null : res;
};

const parseBool = (value: string) => {
    switch (value.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return null;
    }
};

const parseValue = (value: string) => {
    const num = parseNumber(value);
    if (num !== null) {
        return num;
    }

    const b = parseBool(value);
    if (b !== null) {
        return b;
    }

    return value;
};

export type Value = string | number | boolean | Value[] | ValueRecord;
export interface ValueRecord extends Record<string, Value> {}

export default function extractJson(elem: HTMLElement, prefix: string): ValueRecord {
    const attrPrefix = prefix.endsWith(":") ? prefix : `${prefix}:`;

    const res = {};

    const attributes = [];

    for (const attrName in elem.attributes) {
        const attrValue =
            elem.attributes[attrName] instanceof Attr
                ? elem.attributes[attrName].value
                : (elem.attributes[attrName] as string);

        if (!attrName.startsWith(attrPrefix)) {
            continue;
        }

        attributes.push([attrName, attrValue]);
    }

    attributes.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    for (const [attrName, attrValue] of attributes) {
        const path = attrName.slice(attrPrefix.length);
        const parts = path.split(".");

        let pathParts: (string | number)[] = [];

        for (const part of parts) {
            const arrayPart = parseArraySegment(part);

            if (arrayPart !== null) {
                pathParts = pathParts.concat(arrayPart);
                continue;
            }

            const camelCasePart = convertKebabCaseToCamelCase(part);

            if (camelCasePart) {
                pathParts.push(camelCasePart);
            }
        }

        let current: Record<string, Value> = res;

        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];

            if (!current[part]) {
                current[part] = typeof pathParts[i + 1] === "number" ? [] : {};
            }

            current = current[part] as ValueRecord; // as we don't go to the leaf this has to be a record
        }

        const key = pathParts[pathParts.length - 1];
        const value = parseValue(attrValue);

        // dont directly set indices for
        if (Array.isArray(current)) {
            current.push(value);
            continue;
        }

        current[key] = value;
    }

    return res;
}
