const input = document.getElementById('bgUpload');
const preview = document.getElementById('letterBackground');
const fileName = document.getElementById('fileName');
input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg']; // jpeg, jpg 둘 다 'image/jpeg'이야!
    if (!validTypes.includes(file.type)) {
        alert('png, jpg, jpeg 파일만 업로드할 수 있어요!');
        input.value = ''; // 선택 취소
        preview.src = '';
        fileName.textContent = '허용된 형식의 이미지를 업로드해주세요 ♡̄̈';
        return;
    }

    const url = URL.createObjectURL(file);
    preview.style.backgroundImage = `url('${url}')`;
    fileName.textContent = `업로드한 파일: ${file.name}`;
});

//opacity 설정 ============
const imgOpacity = document.getElementById('opacity');
const imgOpacityValue = document.getElementById('val');
//const target = document.body; // 바꿀 대상

const applyOpacity = () => {
    imgOpacityValue.textContent = imgOpacity.value;
    preview.style.opacity = imgOpacity.value;
};
imgOpacity.addEventListener('input', applyOpacity);
applyOpacity();

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

    const bgImage = preview?.style?.backgroundImage;

    if (!bgImage || bgImage === 'none') {
        alert('이미지를 첨부해주세요~! 🥺');
        return;
    }

    // 에디터에서 작성된 HTML 가져오기
    const editorHtml = window.myEditor.getContents(); // getContents()는 HTML 반환

    // editorContent 요소에 넣어주기
    const editorContent = document.getElementById('editorContent');
    editorContent.innerHTML = editorHtml;

    removeAllShow();
    secondStepWrap.classList.add('show');
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

//이미지 저장 ===========
function saveImg(){
    const target = document.getElementById('letterArea');

    html2canvas(target, {
        useCORS: true,
        allowTaint: false,
        scale: Math.min(window.devicePixelRatio || 1, 2), // 과도한 스케일 방지
        scrollY: -window.scrollY, // 화면 스크롤 보정
    }).then(async (canvas) => {
        // 1) Blob으로 받기
        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                if (!blob) { openFallback(canvas); return; }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'letter.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        } else {
            // 2) 폴백: 새 탭 열기(길게 눌러 저장)
            openFallback(canvas);
        }
    });
}
function openFallback(canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    // iOS/일부 브라우저 대응
    const win = window.open();
    if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0;width:100%;height:100%"></iframe>`);
    }
}

//결과물 속성 조정 ============

const widthRange = document.getElementById('widthRange');
const heightRange = document.getElementById('heightRange');
const widthVal = document.getElementById('widthVal');
const heightVal = document.getElementById('heightVal');
const letterArea = document.getElementById('letterArea');

function updateLetterSizeFromSlider() {
    const width = Number(widthRange.value);
    const height = Number(heightRange.value);

    // UI 반영
    widthVal.textContent = width;
    heightVal.textContent = height;

    // 스타일 적용
    letterArea.style.width = width + 'px';
    letterArea.style.height = height + 'px';
}

// 이벤트 연결
widthRange.addEventListener('input', updateLetterSizeFromSlider);
heightRange.addEventListener('input', updateLetterSizeFromSlider);

// 최초 적용
updateLetterSizeFromSlider();

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
