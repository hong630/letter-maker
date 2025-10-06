const input = document.getElementById('bgUpload');
const preview = document.getElementById('letterBackground');
const fileName = document.getElementById('fileName');
const overlayImg = document.getElementById('resultOverlay');
const imgOpacity = document.getElementById('opacity');
const imgOpacityValue = document.getElementById('val');

input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg']; // jpeg, jpg 둘 다 'image/jpeg'이야!
    if (!validTypes.includes(file.type)) {
        alert('png, jpg, jpeg 파일만 업로드할 수 있어요!');
        input.value = ''; // 선택 취소
        preview.style.backgroundImage = 'none';
        fileName.textContent = '허용된 형식의 이미지를 업로드해주세요 ♡̄̈';
        return;
    }

    const url = URL.createObjectURL(file);
    preview.style.backgroundImage = `url('${url}')`;
    fileName.textContent = `업로드한 파일: ${file.name}`;
});

//이전, 다음 버튼 ============
const firstStepWrap = document.getElementById('first_step');
const secondStepWrap = document.getElementById('second_step');
const allWraps = document.querySelectorAll('.wrap');

function removeAllShow(){
    allWraps.forEach((wrap)=>{
        if(wrap.classList.contains('show')) wrap.classList.remove('show');
    })
}
function goNext(){
    if (!window.myEditor) { alert('에디터 로딩 중이에요~ 잠시만요!'); return; }

    const bgImage = preview?.style?.backgroundImage;
    if (!bgImage || bgImage === 'none') { alert('이미지를 첨부해주세요~! 🥺'); return; }

    const editorHtml = window.myEditor.getContents();
    document.getElementById('editorContent').innerHTML = editorHtml;

    removeAllShow();
    secondStepWrap.classList.add('show');

    //보이게 된 다음 프레임에 렌더
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const defaultWidth = isMobile ? 200 : 1000;
        const defaultHeight = isMobile ? 200 : 2000;
        const w = Number(widthRange.value) || defaultWidth;
        const h = Number(heightRange.value) || defaultHeight;
        setLetterSize(w, h);       // ← 먼저 사이즈 고정
        beginStyleChange();
        endStyleChange();
    }));
}


function goPrev(){
    removeAllShow();
    firstStepWrap.classList.add('show');
}

//에디터 ============
document.addEventListener('DOMContentLoaded', () => {
    const editorHeight = '300px';

    const editor = window.SUNEDITOR.create('editor_container', {
        fontSize: ['8','10','12','14','16','18','20','24','28','32','36','72'],
        defaultStyle: 'font-size: 16px;',
        lang: window.SUNEDITOR_LANG.ko,
        width: '100%',
        height: editorHeight,
        buttonList: [
            ['fontSize'],
            ['bold','underline','italic'],
            ['fontColor','hiliteColor','align'],
        ],
        iframe: true,
        iframeCSSFileName: 'https://cdn.jsdelivr.net/npm/suneditor/dist/css/suneditor.min.css'
    });

    window.myEditor = editor;
});

function refreshText() {
    if (!window.myEditor) return;
    // 에디터 내용 싹 비우기
    window.myEditor.setContents('');

    // 미리보기 넣던 곳도 같이 비움
    if (preview) preview.innerHTML = '';
}

//이미지 저장 ==========
//결과물 속성 조정 ============

const widthRange = document.getElementById('widthRange');
const heightRange = document.getElementById('heightRange');
const widthVal = document.getElementById('widthVal');
const heightVal = document.getElementById('heightVal');
const letterArea = document.getElementById('letterArea');

let updateTimer = null;
let isRendering = false;

/** 스타일 변경 시작할 때 호출: 오버레이 잠깐 치우고 배경/원본 보여주기 */
function beginStyleChange() {
    if (!overlayImg) return;
    overlayImg.style.display = 'none';     // 오버레이 숨김
    preview.style.visibility = 'visible'; // 배경은 보이게
}

/** 스타일 변경 끝났을 때 호출: 1초 후 캡쳐해서 오버레이 덮기 */
function endStyleChange() {
    if (!overlayImg) return;
    if (updateTimer) clearTimeout(updateTimer);

    updateTimer = setTimeout(async () => {
        if (isRendering) return; // 렌더 중이면 스킵
        isRendering = true;

        // 캡쳐 전에 오버레이는 숨겨져 있어야 editorContent가 찍힘
        const prev = overlayImg.style.display;
        overlayImg.style.display = 'none';

        // 에디터 내부 이미지 로딩 보장(있으면)
        await Promise.all([...letterArea.querySelectorAll('img')].map(img => {
            if (img.complete) return;
            return new Promise(r => { img.onload = img.onerror = r; });
        }));

        const canvas = await renderCanvas(letterArea, isMobile() ? 2 : 2); // 미리보기용 2배
        const dataUrl = canvas.toDataURL('image/png');

        overlayImg.src = dataUrl;
        overlayImg.style.display = isMobile ? 'block' : 'none';
        isRendering = false;
    }, 1000); // ← “이벤트 끝난 후 1초”
}

/* 예시: 슬라이더/폰트 변경 시 */
widthRange.addEventListener('input', () => {
    beginStyleChange();
    const w = Number(widthRange.value) || 200;
    const h = Number(heightRange.value) || 300;
    widthVal.textContent = w;
    setLetterSize(w, h);
});
widthRange.addEventListener('change', endStyleChange);

heightRange.addEventListener('input', () => {
    beginStyleChange();
    const w = Number(widthRange.value) || 200;
    const h = Number(heightRange.value) || 300;
    heightVal.textContent = h;
    setLetterSize(w, h);
});
heightRange.addEventListener('change', endStyleChange);

document.getElementById('fontSelect').addEventListener('change', () => {
    beginStyleChange();
    // … 폰트 적용 …
    endStyleChange();
});

/* opacity 바뀔 때도 동일하게 */
imgOpacity.addEventListener('input', () => {
    beginStyleChange();
});
imgOpacity.addEventListener('change', endStyleChange);

const isMobile = () => matchMedia('(hover: none) and (pointer: coarse)').matches;

/* 공통: html2canvas 옵션 */
function renderCanvas(target, scale = 2) {
    return html2canvas(target, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,                      // 투명 배경 유지
        scale,                                      // 미리보기 2배, 저장용 10배 등
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
    });
}

/* 1-3: 속성 변경 즉시 미리보기 렌더 + 오버레이 적용 */
let renderTimer;
function renderPreviewOverlay() {
    if (!overlayImg) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(async () => {
        console.log('rendering… vis=', getComputedStyle(letterArea).display,
            'size=', letterArea.offsetWidth, letterArea.offsetHeight);

        const canvas = await renderCanvas(letterArea, 2);
        console.log('canvas size=', canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        console.log('dataUrl length=', dataUrl.length); //  "data:,"면 길이 매우 짧음(6~7)
        overlayImg.src = dataUrl;
        if (isMobile()) { overlayImg.style.display = 'block'; }
        else { overlayImg.style.display = 'block'; }
    }, 120);
}


/* 4-5: 저장 버튼 동작
   - 모바일: 오버레이만 유지(꾹 눌러 저장 안내)
   - 데스크탑: 10배 스케일로 파일 다운로드
*/
async function saveImg() {
    // 캔버스 오염 방지: 외부 IMG에 crossorigin 부여 (서버 CORS 필요)
    letterArea.querySelectorAll('img').forEach(img => {
        if (!img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
            img.setAttribute('crossorigin', 'anonymous');
        }
    });

    // 모바일이면: 이미 오버레이가 올라가 있으므로 별도 다운로드 X
    if (isMobile()) {
        // 미리보기 최신화만 보장
        await renderPreviewOverlay();
        // 사용자는 오버레이 이미지를 길게 눌러 저장
        return;
    }

    // 데스크탑: 10배 저장(예: 200x300 → 2000x3000)
    const EXPORT_SCALE = 10;
    const canvas = await renderCanvas(letterArea, EXPORT_SCALE);

    // toBlob 다운로드
    canvas.toBlob((blob) => {
        if (!blob) return openFallback(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'letter.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 1500);
    }, 'image/png');

    // 다운로드 후에도 화면엔 미리보기 오버레이 유지하고 싶으면:
    renderPreviewOverlay();
}

/* 폴백: 새 탭으로 dataURL */
function openFallback(canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open();
    if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0;width:100%;height:100%"></iframe>`);
    }
}

//opacity 설정 ============
//const target = document.body; // 바꿀 대상

const applyOpacity = () => {
    imgOpacityValue.textContent = imgOpacity.value;
    preview.style.opacity = imgOpacity.value;
    renderPreviewOverlay();
};
imgOpacity.addEventListener('input', applyOpacity);
applyOpacity();

//폰트 변경 ==========

document.getElementById('fontSelect').addEventListener('change', function () {
    const selectedFont = this.value;

    // sun-editor 내부 iframe 사용 시
    const editable = document.querySelectorAll('.sun-editor-editable');

    if (editable.length > 0) {
        editable.forEach((item)=>{
            item.style.fontFamily = selectedFont;
        })
    }
});


//width height 설정
function setLetterSize(w, h) {
    letterArea.style.width = w + 'px';
    letterArea.style.height = h + 'px';

    // 배경 div가 영역을 꽉 채우도록(안전장치)
    preview.style.width = '100%';
    preview.style.height = '100%';
}
