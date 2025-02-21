import { describe, expect, it } from "vitest";
import { extractJson } from "../src/main.ts";

const createElem = (elemType: string, attributes: Record<string, string>) => {
    const elem = document.createElement(elemType);

    for (const key in attributes) {
        elem.attributes[key] = attributes[key];
    }

    return elem;
};

describe("attr2json", () => {
    it("can parse simple value", () => {
        const elem = createElem("div", {
            "attr2json:name": "Hello, World",
        });

        const parsed = extractJson(elem, "attr2json");

        expect("name" in parsed).toBeTruthy();
        expect(parsed.name).toBe("Hello, World");
    });

    it("can parse number values", () => {
        const elem = createElem("div", {
            "attr2json:a": "5",
            "attr2json:b": "95",
            "attr2json:result": "100",
            "attr2json:float": "13.37",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.a).toBe(5);
        expect(parsed.b).toBe(95);
        expect(parsed.result).toBe(100);
        expect((parsed.a as number) + (parsed.b as number)).toBe(parsed.result);
        expect(parsed.float).toBe(13.37);
    });

    it("can parse boolean values", () => {
        const elem = createElem("div", {
            "attr2json:the-truth": "true",
            "attr2json:the-lie": "false",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.theTruth).toBe(true);
        expect(parsed.theLie).toBe(false);
    });

    it("can convert camel case strings", () => {
        const elem = createElem("div", {
            "attr2json:best-name-ever": "John Doe",
        });

        const parsed = extractJson(elem, "attr2json");

        expect("bestNameEver" in parsed).toBeTruthy();
        expect(parsed.bestNameEver).toBe("John Doe");
    });

    it("can parse nested keys", () => {
        const elem = createElem("div", {
            "attr2json:a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.user-name": "John Doe",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(
            parsed["a"]["b"]["c"]["d"]["e"]["f"]["g"]["h"]["i"]["j"]["k"]["l"]["m"]["n"]["o"]["p"]["q"]["r"]["s"]["t"][
                "u"
            ]["v"]["w"]["x"]["y"]["z"]["userName"],
        ).toBe("John Doe");
    });

    it("does not confuse keys", () => {
        const elem = createElem("div", {
            "a:value": "1337",
            "b:value": "42",
            "c:value": "Test",
        });

        const parsedA = extractJson(elem, "a");
        const parsedB = extractJson(elem, "b");
        const parsedC = extractJson(elem, "c");

        expect(parsedA.value).toBe(1337);
        expect(parsedB.value).toBe(42);
        expect(parsedC.value).toBe("Test");
    });

    it("can parse arrays", () => {
        const elem = createElem("div", {
            "attr2json:numbers[0]": "1",
            "attr2json:numbers[1]": "2",
            "attr2json:numbers[2]": "3",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.numbers).toStrictEqual([1, 2, 3]);
        expect(parsed.numbers).toHaveLength(3);
    });

    it("can parse arrays with weird indices", () => {
        const elem = createElem("div", {
            "attr2json:numbers[1]": "1",
            "attr2json:numbers[5]": "2",
            "attr2json:numbers[100]": "3",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.numbers).toStrictEqual([1, 2, 3]);
        expect(parsed.numbers).toHaveLength(3);
    });

    it("can parse arrays with inverted order", () => {
        const elem = createElem("div", {
            "attr2json:numbers[100]": "3",
            "attr2json:numbers[5]": "2",
            "attr2json:numbers[1]": "1",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.numbers).toStrictEqual([1, 2, 3]);
        expect(parsed.numbers).toHaveLength(3);
    });

    it("can parse arrays with nested objects", () => {
        const elem = createElem("div", {
            "attr2json:users[0].id": "1",
            "attr2json:users[0].name": "Andi",
            "attr2json:users[0].skills[0].name": "Programming",
            "attr2json:users[0].skills[0].value": "10",
            "attr2json:users[1].id": "2",
            "attr2json:users[1].name": "Brit",
            "attr2json:users[2].id": "3",
            "attr2json:users[2].name": "Charles",
        });

        const parsed = extractJson(elem, "attr2json");

        expect(parsed.users).toHaveLength(3);
        expect(parsed.users).toStrictEqual([
            {
                id: 1,
                name: "Andi",
                skills: [
                    { name: "Programming", value: 10 },
                ]
            },
            {
                id: 2,
                name: "Brit",
            },
            {
                id: 3,
                name: "Charles",
            },
        ]);
    });
});
