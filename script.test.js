/**
 * @jest-environment jsdom
 */

const { filterCourses } = require('./script.js');

describe('filterCourses', () => {
    const mockData = [
        { sem: 1, code: "CSC109", title: "Introduction to Information Technology", credits: 3, category: "Core IT", desc: "..." },
        { sem: 1, code: "CSC110", title: "C Programming", credits: 3, category: "Programming", desc: "..." },
        { sem: 2, code: "CSC160", title: "Discrete Structure", credits: 3, category: "Mathematics", desc: "..." },
    ];

    test('returns all courses when sem is all and query is empty', () => {
        const result = filterCourses(mockData, 'all', '');
        expect(result.length).toBe(3);
    });

    test('filters by specific semester', () => {
        const result = filterCourses(mockData, '1', '');
        expect(result.length).toBe(2);
        expect(result.map(c => c.code)).toEqual(["CSC109", "CSC110"]);
    });

    test('filters by query matching title', () => {
        const result = filterCourses(mockData, 'all', 'programming');
        expect(result.length).toBe(1);
        expect(result[0].code).toBe("CSC110");
    });

    test('filters by query matching category', () => {
        const result = filterCourses(mockData, 'all', 'mathematics');
        expect(result.length).toBe(1);
        expect(result[0].code).toBe("CSC160");
    });

    test('filters by query matching code', () => {
        const result = filterCourses(mockData, 'all', 'csc109');
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Introduction to Information Technology");
    });

    test('filters by both semester and query', () => {
        // Query matches CSC160 but it's in Sem 2. We filter by Sem 1.
        const result = filterCourses(mockData, '1', 'discrete');
        expect(result.length).toBe(0);

        // Query matches CSC110 and it's in Sem 1.
        const result2 = filterCourses(mockData, '1', 'programming');
        expect(result2.length).toBe(1);
        expect(result2[0].code).toBe("CSC110");
    });

    test('returns empty array when no match found', () => {
        const result = filterCourses(mockData, 'all', 'notfoundquery');
        expect(result.length).toBe(0);
    });
});
