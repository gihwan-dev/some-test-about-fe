import React, { useState, useCallback } from 'react';
import { Check, X, Copy, AlertCircle, Timer, BarChart2 } from 'lucide-react';
import {cloneDeep} from "es-toolkit";
import * as _ from "lodash";

// Types
interface TestCase {
    title: string;
    data: unknown;
}

interface Method {
    id: 'structured' | 'json' | 'es-toolkit' | 'lodash';
    name: string;
}

interface PerformanceResult {
    success: boolean;
    average?: number;
    min?: number;
    max?: number;
    samples?: number[];
}

interface PerformanceResults {
    [key: string]: PerformanceResult;
}

interface CloneResult {
    success: boolean;
    result?: unknown;
    error?: string;
}

// Constants
const testCases: Record<string, TestCase> = {
    simple: {
        title: "간단한 객체",
        data: { name: "John", age: 30 }
    },
    date: {
        title: "Date 객체",
        data: { date: new Date(), simple: "test" }
    },
    mapSet: {
        title: "Map과 Set",
        data: {
            map: new Map([['key', 'value']]),
            set: new Set([1, 2, 3])
        }
    },
    circular: {
        title: "순환 참조",
        data: (() => {
            const obj: { name: string; self?: object } = { name: 'circular' };
            obj.self = obj;
            return obj;
        })()
    },
    function: {
        title: "함수 포함",
        data: {
            method: function() { return 'test'; },
            arrow: () => 'test'
        }
    },
    special: {
        title: "특수한 값",
        data: {
            nan: NaN,
            infinity: Infinity,
            undefined: undefined,
            null: null,
            symbol: Symbol('test')
        }
    },
    large: {
        title: "대용량 데이터",
        data: (() => {
            const obj: Record<string, unknown> = {};
            for(let i = 0; i < 10000; i++) {
                obj[`key${i}`] = {
                    id: i,
                    value: `value${i}`,
                    nested: { data: `nested${i}` }
                };
            }
            return obj;
        })()
    }
};

const methods: Method[] = [
    { id: 'structured', name: 'structuredClone' },
    { id: 'json', name: 'JSON.parse/stringify' },
    { id: 'es-toolkit', name: 'es-toolkit' },
    { id: 'lodash', name: 'lodash' },
];

// Utils
function safeStringify(obj: unknown, indent: number = 2): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        // 특수한 타입들 처리
        if (value instanceof Map) return `Map(${[...value].length})`;
        if (value instanceof Set) return `Set(${[...value].length})`;
        if (typeof value === 'function') return `Function: ${value.name || 'anonymous'}`;
        if (value instanceof Date) return `Date: ${value.toISOString()}`;
        if (value === undefined) return 'undefined';
        if (Number.isNaN(value)) return 'NaN';
        return value;
    }, indent);
}

function tryClone(data: unknown, method: Method['id']): CloneResult {
    try {
        switch(method) {
            case 'structured':
                return { success: true, result: structuredClone(data) };
            case 'json':
                return { success: true, result: JSON.parse(JSON.stringify(data)) };
            case 'es-toolkit':
                return {
                    success: true,
                    result: cloneDeep(data),
                };
            case "lodash":
                return {
                    success: true,
                    result: _.cloneDeep(data),
                }
            default:
                return { success: false, error: 'Unknown method' };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

function measurePerformance(
    data: unknown,
    method: Method['id'],
    iterations = 100
): PerformanceResult {
    const times: number[] = [];

    for(let i = 0; i < iterations; i++) {
        const start = performance.now();
        try {
            tryClone(data, method);
            const end = performance.now();
            times.push(end - start);
        } catch {
            return { success: false };
        }
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    return {
        success: true,
        average: avg,
        min: Math.min(...times),
        max: Math.max(...times),
        samples: times
    };
}

// Component
const CloneMethodsComparison: React.FC = () => {
    const [selectedCase, setSelectedCase] = useState<string>('simple');
    const [performanceResults, setPerformanceResults] = useState<PerformanceResults | null>(null);

    const runPerformanceTest = useCallback(() => {
        const results = methods.reduce<PerformanceResults>((acc, method) => {
            acc[method.id] = measurePerformance(testCases[selectedCase].data, method.id);
            return acc;
        }, {});

        setPerformanceResults(results);
    }, [selectedCase]);

    const renderResult = (methodId: Method['id']) => {
        const result = tryClone(testCases[selectedCase].data, methodId);
        return (
            <div className="mt-2">
                {result.success ? (
                    <div className="flex items-center space-x-2 text-green-600">
                        <Check size={16} />
                        <span>성공</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                        <X size={16} />
                        <span>{result.error}</span>
                    </div>
                )}
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
        {result.success
            ? safeStringify(result.result)
            : '복사 실패'}
      </pre>
            </div>
        );
    };

    const renderPerformanceResult = (methodId: Method['id']) => {
        if (!performanceResults || !performanceResults[methodId].success) {
            return <div className="text-red-500">측정 실패</div>;
        }

        const result = performanceResults[methodId];
        const maxTime = Math.max(
            ...Object.values(performanceResults)
                .filter((r): r is Required<PerformanceResult> => r.success && r.average !== undefined)
                .map(r => r.average)
        );

        return (
            <div className="space-y-2">
                <div className="relative h-4 bg-gray-200 rounded">
                    <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded"
                        style={{ width: `${((result.average ?? 0) / maxTime) * 100}%` }}
                    />
                </div>
                <div className="text-sm space-y-1">
                    <div>평균: {result.average?.toFixed(3)}ms</div>
                    <div className="text-gray-500">
                        <span>최소: {result.min?.toFixed(3)}ms</span>
                        <span className="mx-2">|</span>
                        <span>최대: {result.max?.toFixed(3)}ms</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl text-center font-bold mb-4">클론 방식 비교</h1>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(testCases).map(([key, { title }]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setSelectedCase(key);
                                setPerformanceResults(null);
                            }}
                            className={`px-3 py-2 rounded ${
                                selectedCase === key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {title}
                        </button>
                    ))}
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <AlertCircle size={16} />
                            <span>테스트 객체</span>
                        </div>
                        <button
                            onClick={runPerformanceTest}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Timer size={16} />
                            <span>성능 테스트 실행</span>
                        </button>
                    </div>
                    <pre className="mt-2 p-2 bg-white rounded border max-h-40 overflow-auto">
            {safeStringify(testCases[selectedCase].data)}
          </pre>
                </div>

                {performanceResults && (
                    <div className="border rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <BarChart2 size={20} />
                            <span>성능 비교</span>
                        </h2>
                        <div className="space-y-6">
                            {methods.map(method => (
                                <div key={method.id} className="space-y-2">
                                    <h3 className="font-medium">{method.name}</h3>
                                    {renderPerformanceResult(method.id)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {methods.map(method => (
                        <div key={method.id} className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                                <Copy size={16} />
                                <span>{method.name}</span>
                            </h3>
                            {renderResult(method.id)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CloneMethodsComparison;