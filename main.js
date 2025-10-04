const input = document.getElementById('imgInput');
const preview = document.getElementById('preview');

// input.addEventListener('change', () => {
//     const file = input.files?.[0];
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     preview.src = url; // 캔버스 쓸 거면 img 대신 drawImage로 사용
// });

//opacity 설정
const imgOpacity = document.getElementById('opacity');
const imgOpacityValue = document.getElementById('val');
//const target = document.body; // 바꿀 대상

const apply = () => {
    imgOpacityValue.textContent = imgOpacity.value;
    //target.style.opacity = r.value;
};
imgOpacity.addEventListener('input', apply);
apply();