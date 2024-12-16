import {useState, useCallback, MouseEvent} from 'react';
import { throttle, debounce } from "es-toolkit";

type PositionWithTime = { x: number, y: number, time: number}

const ThrottleDebounceDemo = () => {
    const [, setMousePosition] = useState({ x: 0, y: 0 });
    const [normalEvents, setNormalEvents] = useState<{ x: number, y: number, time: number}[]>([]);
    const [throttledEvents, setThrottledEvents] = useState<PositionWithTime[]>([]);
    const [debouncedEvents, setDebouncedEvents] = useState<PositionWithTime[]>([]);

    // 일반 이벤트 처리
    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>, rect: DOMRect) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
        setNormalEvents(prev => [...prev.slice(-29), { x, y, time: Date.now() }]);
    }, []);

    // 쓰로틀링된 이벤트 처리
    const handleThrottledMove = useCallback(
        throttle((e, rect) => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setThrottledEvents(prev => [...prev.slice(-29), { x, y, time: Date.now() }]);
        }, 200),
        []
    );

    // 디바운스된 이벤트 처리
    const handleDebouncedMove = useCallback(
        debounce((e, rect) => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDebouncedEvents(prev => [...prev.slice(-29), { x, y, time: Date.now() }]);
        }, 200),
        []
    );

    const renderEvents = (events: PositionWithTime[], color: string) => {
        return events.map((event, i) => (
            <div
                key={event.time}
                className={`absolute w-2 h-2 rounded-full ${color} transition-opacity`}
                style={{
                    left: `${event.x}px`,
                    top: `${event.y}px`,
                    opacity: (i + 1) / events.length
                }}
            />
        ));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center mb-8">쓰로틀링 vs 디바운스 데모</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 일반 이벤트 */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold">일반</h2>
                        <span className="text-sm text-gray-500">
              (이벤트: {normalEvents.length})
            </span>
                    </div>
                    <div
                        className="relative h-64 bg-gray-100 rounded-lg overflow-hidden"
                        onMouseMove={(e) => handleMouseMove(e, e.currentTarget.getBoundingClientRect())}
                    >
                        {renderEvents(normalEvents, 'bg-blue-500')}
                    </div>
                </div>

                {/* 쓰로틀링 */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold">쓰로틀링</h2>
                        <span className="text-sm text-gray-500">
              (200ms, 이벤트: {throttledEvents.length})
            </span>
                    </div>
                    <div
                        className="relative h-64 bg-gray-100 rounded-lg overflow-hidden"
                        onMouseMove={(e) => handleThrottledMove(e, e.currentTarget.getBoundingClientRect())}
                    >
                        {renderEvents(throttledEvents, 'bg-green-500')}
                    </div>
                </div>

                {/* 디바운스 */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold">디바운스</h2>
                        <span className="text-sm text-gray-500">
              (200ms, 이벤트: {debouncedEvents.length})
            </span>
                    </div>
                    <div
                        className="relative h-64 bg-gray-100 rounded-lg overflow-hidden"
                        onMouseMove={(e) => handleDebouncedMove(e, e.currentTarget.getBoundingClientRect())}
                    >
                        {renderEvents(debouncedEvents, 'bg-red-500')}
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
                <p>👉 각 박스 위에서 마우스를 움직여보세요:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="text-blue-500 font-semibold">일반</span>: 모든 마우스 이벤트 발생</li>
                    <li><span className="text-green-500 font-semibold">쓰로틀링</span>: 200ms 간격으로 이벤트 제한</li>
                    <li><span className="text-red-500 font-semibold">디바운스</span>: 마우스 움직임이 멈춘 후 200ms 후에 이벤트 발생</li>
                </ul>
            </div>
        </div>
    );
};

export default ThrottleDebounceDemo;