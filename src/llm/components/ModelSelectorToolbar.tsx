import React, { useState } from 'react';
import { useProgramState } from '../Sidebar';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faExpand, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Vec3 } from '@/src/utils/vector';
import { Mat4f } from '@/src/utils/matrix';
import s from './MovementControls.module.scss';
import { isCommentary } from '../walkthrough/WalkthroughTools';
import { PhaseTimeline, PhaseTimelineHoriz } from '../PhaseTimeline';

export const ModelSelectorToolbar: React.FC<{
}> = () => {
    // Define the Position type
    type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

    // Define the position map with specific types
    const positionMap: Record<Position, {top?: string; left?: string, bottom?: string, right?: string}> = {
        'top-left': { top: '40px', left: '0' },
        'top-right': { top: '0', right: '0' },
        'bottom-left': { bottom: '30px', left: '0' },
        'bottom-right': { bottom: '30px', right: '0' }
    };
    let progState = useProgramState();
    const [popupContent, setPopupContent] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState(positionMap['top-left']);

    function makeButton(egIndex: number) {

        let example = progState.examples[egIndex] ?? progState.mainExample;

        let isEnabled = example.enabled;
        let isActive = progState.currExampleId === egIndex;

        function handleClick() {
            if (!isEnabled) {
                example.enabled = true;
            }
            progState.currExampleId = egIndex;
            progState.camera.desiredCamera = example.camera;
            progState.markDirty();
        }

        return <div className={clsx('m-2 p-2 rounded shadow cursor-pointer hover:bg-blue-300', isActive ? 'bg-blue-200' : 'bg-white')} onClick={handleClick}>
            {example.name}
        </div>;
    }

    function onExpandClick() {
        let example = progState.examples[progState.currExampleId] ?? progState.mainExample;
        progState.camera.desiredCamera = example.camera;
        progState.markDirty();
    }

    function onNextClick() {
        let wt = progState.walkthrough;
        if (wt.time >= wt.phaseLength) {
            // jumpPhase(wt, 1);
            wt.time = 0;
        } else {
            wt.running = !wt.running;
        }
        progState.markDirty();
        const commentaryInfo = getCommentaryText();
        setPopupContent(commentaryInfo.text);
        setPopupPosition(positionMap[commentaryInfo.position])
        setPopupVisible(true);
    }

    function onPrevClick() {
        let wt = progState.walkthrough;
        wt.running = !wt.running;
        wt.time = getPrevCommentaryTime();
        progState.markDirty();
        const commentaryInfo = getCommentaryText();
        setPopupContent(commentaryInfo.text);
        setPopupPosition(positionMap[commentaryInfo.position])
        setPopupVisible(true);
    }

    function getPrevCommentaryTime() {
        let wt = progState.walkthrough;
        let count = 0;

        for (let i = wt.times.length - 1; i >= 0; i--) {
            if (wt.times[i].start < wt.time && isCommentary(wt.times[i])) {
                count++;
                if (count === 2) {
                    return wt.times[i].start;
                }
            }
        }
        return 0; // Or a default value if no previous commentary is found
    }

    function getCommentaryText(): { text: string, position: Position } {
        let wt = progState.walkthrough;
        let currentCommentary = wt.times.find(timeObj => timeObj.start >= wt.time && isCommentary(timeObj));
        if (currentCommentary && isCommentary(currentCommentary)) {
            return {
                text: currentCommentary.strings.join(' '),
                position: currentCommentary.position || 'top-left'
            };
        }
        return {
            text: 'No commentary available for the current time.',
            position: 'top-left'
        };
    }

    function onMagnifyClick() {
        let example = progState.examples[progState.currExampleId] ?? progState.mainExample;
        let layout = example.layout ?? progState.layout;

        // new Vec3(3.347, 48.000, -2.634), new Vec3(270.000, 4.500, 1.199)

        // new Vec3(-1.771, 0.750, -4.470), new Vec3(270.000, 4.500, 0.739)

        let obj = layout.residual0;
        let modelTarget = new Vec3(obj.x, obj.y, obj.z);
        let modelMtx = progState.camera.modelMtx.mul(Mat4f.fromTranslation(example.offset))

        let center = modelMtx.mulVec3Proj(modelTarget);
        let zoom = progState.currExampleId === -1 ? 0.7 : 4;
        progState.camera.desiredCamera = {
            center, angle: new Vec3(270, 4.5, zoom),
        };
        progState.markDirty();

    }

    const getPopupStyle = () => {
        let style: React.CSSProperties = {};
        if (popupPosition.top) style.top = `${popupPosition.top}`;
        if (popupPosition.right) style.right = `${popupPosition.right}`;
        if (popupPosition.bottom) style.bottom = `${popupPosition.bottom}`;
        if (popupPosition.left) style.left = `${popupPosition.left}`;
        style.width = '35%'
        return style;
    };

    return(
        <div>
            <div className='absolute top-0 left-0 flex flex-col'>
                <div className='ml-2 flex flex-row'>
                    <button className={clsx(s.btn, s.prevNextBtn, 'm-2')} onClick={onPrevClick}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div className={clsx('m-2 p-2 bg-white min-w-[2rem] flex justify-center rounded shadow cursor-pointer hover:bg-blue-300')} onClick={onExpandClick}>
                        <FontAwesomeIcon icon={faExpand} />
                    </div>
                    <div className={clsx('m-2 p-2 bg-white min-w-[2rem] flex justify-center rounded shadow cursor-pointer hover:bg-blue-300')} onClick={onMagnifyClick}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                    <button className={clsx(s.btn, s.prevNextBtn, 'm-2')} onClick={onNextClick}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            {popupVisible && (
                <div
                    className='absolute bg-white p-4 border shadow'
                    style={getPopupStyle()}
                >
                    {popupContent}
                </div>
            )}
            <div className='absolute left-0 bottom-0 w-full m-5'>
                <PhaseTimelineHoriz times={progState.walkthrough.times!} />
            </div>
        </div>
    );

};
