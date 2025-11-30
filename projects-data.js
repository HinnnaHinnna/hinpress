// ============================================
// projects-data.js
// - 파일 이름을 규칙적으로 맞추고
//   JS에서 자동으로 images 배열을 만드는 버전
// ============================================

/**
 * 폴더 + 베이스 파일명 + 개수만으로
 * 이미지 경로 배열을 자동 생성하는 함수
 *
 * 예)
 *   generateImageArray('image/2024/논문', '논문', 3)
 * → [
 *     'image/2024/논문/논문_00.jpg',
 *     'image/2024/논문/논문_01.jpg',
 *     'image/2024/논문/논문_02.jpg'
 *   ]
 *
 * - padLength: 번호 자릿수 (2 → 00, 01, 02 / 3 → 000, 001 ...)
 * - ext: 확장자 (jpg, png 등)
 */
function generateImageArray(folder, baseName, count, padLength = 2, ext = 'jpg') {
  const result = [];

  for (let i = 0; i < count; i++) {
    const indexStr = String(i).padStart(padLength, '0'); // 0 → "00"

    // ✅ ext가 문자열이면 그대로, 배열이면 인덱스에 맞는 확장자 사용
    let thisExt;
    if (Array.isArray(ext)) {
      // 배열 길이보다 많으면 마지막 것을 재사용하도록
      thisExt = ext[i] || ext[ext.length - 1] || 'jpg';
    } else {
      thisExt = ext || 'jpg';
    }

    const path = `${folder}/${baseName}_${indexStr}.${thisExt}`;
    result.push(path);
  }

  return result;
}


// ============================================
// 원본 프로젝트 데이터 (rawProjects)
// - 여기서는 images 배열을 직접 쓰지 않고,
//   imageFolder / imageBaseName / imageCount만 적는다.
// ============================================
const rawProjects = [
  {
    id: 1,
    title: '쓰기 = 다시말하기;',
    subtitle: '책',
    year: '2024',
    specs: '에폭시, 무선제본',
    size: ['185x255mm', '72p'],
    description:
      '매체를 소재로 한 논문이라서 표지 컨셉은 블랙미러이다. 표지의 에폭시로 칠한 부분은 내지의 본문 그리드에 해당된다. 내지에는 코딩에서 쓰는 코드를 디자인 요소로 체계를 탐구한 연구 기록이다. 중심으로 한 그래픽 디자인 시리즈입니다. 글자의 형태와 배열을 통해 시각적 리듬과 균형을 탐구했습니다. 정체 활자를 가로로 잘게 나눈 다음 조각들을 일정 간격으로 옮겨 글자 전체가 기울어진 느낌이 들게 했습니다.',
    category: 'Graphic Design',
    client: ['개인 작업, 서울시립대학교 디자인석사청구'],

    // 🔽 이미지 경로 자동 생성을 위한 정보들
    // 실제 파일 위치: image/2024/논문/논문_00.jpg, _01.jpg, _02.jpg ...
    imageFolder: 'image/2024/논문',
    imageBaseName: '논문',
    imageCount: 16,        // 논문_00.jpg ~ 논문_02.jpg → 3장
    imageExt: 'jpg',      // 확장자
    padLength: 2          // 00, 01, 02...
  },
  {
    id: 2,
    title: '심안',
    subtitle: '책',
    year: '2022',
    specs: '무선제본',
    size: ['125x130mm', '296p'],
    description:
      '라쿠고 <심안> 원문과 그 라쿠고를 리메이크한 일본 드라마 <심안> 자막을 동시에 읽는 책이다. 표지는 등장 인물의 색깔을 정하고 이를 활용했다. 이는 내지의 등장 인물 대사와 연결된다. 등장인물은 총 4명이다. 왼쪽 면은 주인공 한 명의 대사만, 오른쪽 면은 나머지 3명의 대사만이 나온다. 내지는 상하로 구분되어 상단은 <심안>의 1930년대 최초 원문이, 하단은 드라마의 자막이 흐른다.',
    category: 'Graphic Design',
    client: ['개인 작업, 대학원 수업과제'],
    imageFolder: 'image/2024/심안',
    imageBaseName: '심안',
    imageCount: 9,    // 심안_00.jpg ~ 심안_03.jpg
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 3,
    title: '아카이브 프리즘 - 한국영화 100선',
    subtitle: '책',
    year: '2024',
    specs: '배면인쇄, 먹박, 은박, 흰색실크, 무선제본',
    size: ['255x297mm', '196p'],
    description:
      '『아카이브 프리즘』이라는 계간지 리뉴얼이다. 특히 첫 호는 10년마다 한국영화 100선을 선발하여 기록하는 책이다. 표지에는 100선에 해당하는 영화들이 텍스트로 쓰여 있다. 이 부분은 『아카이브 프리즘』의 아카이브를, 배면 컬러는 암시적 프리즘을 의미한다. 매 호마다 배면 컬러 색이 달라진다.',
    category: 'Graphic Design',
    client: ['한국영상자료원, box8'],
    imageFolder: 'image/2024/아카이브프리즘',
    imageBaseName: '아카이브프리즘',
    imageCount: 19,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 4,
    title: '마침내, 박찬욱',
    subtitle: '책',
    year: '2023',
    specs: '노출제본, 먹박, 하드커버 양장제본',
    size: ['130x190mm', '920p'],
    description:
      '충무로영화제-감독주간에서 발행한 박찬욱 감독 데뷔 30주년 기념도서이다. 박찬욱 감독의 외롭고 화려한 영화 인생을 하드보일드 추리 소설 세계관에 대입했다. 책표지는 2중 구조인데 겉표지는 권총집을 연상하게 하는 검은 인조가죽을 사용했고 오른쪽 면으로 책 배면을 덮는 구조이다. 2개의 책등이 생기는데, 오른쪽 면의 가죽 표지 책등에는 박찬욱 감독이 감독한 22개의 영화 영문 제목이 형압으로 눌려있다. 왼쪽 면의 노출 책등은 원래 실 제본선을 취소선으로 활용해, 본문 제목 중 남의 영화와도 내 영화와도 달라야 했다는 감독의 말을 인용한 Like no other, even like no myself라는 영문 문장으로 디자인하려 했다. 그런데 제작 과정 중 문제가 생겨 현재의 영화 대사 버전으로 바꾸었다. 아쉬워서 이 게시물 마지막에 추가했다. 내지 종이 3종, 별색 3개, 노출 제본, 2개의 책등을 사용했다.',
    category: 'Graphic Design',
    client: ['한국영상자료원, box8'],
    // 예시: image/2024/아카이브프리즘/아카이브프리즘_00.jpg ~ 05.jpg
    // 📌 방금 만든 PDF→JPG 파일도 여기로 옮겨서
    //    이름을 맞춰주면 됨.
    imageFolder: 'image/2024/박찬욱',
    imageBaseName: '박찬욱',
    imageCount: 22,    // 아카이브프리즘_00.jpg ~ _05.jpg 라고 가정
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 5,
    title: '백남준아트센터 소장품 하이라이트',
    subtitle: '책',
    year: '2020',
    specs: '먹박, 소프트 양장제본',
    size: ['180x280mm', '280p'],
    description:
      '표지는 티비 화면을 모티브로 서체 폭이 일정한 모노체를 불규칙적으로 늘리고 줄이면서 사각 프레임으로 이미지화했다. 내지에는 영문 타이틀과 본문에 동일한 영문 서체를 활용, 서체가 돋보일 수 있게 한글 본문과 영문 본문을 상하로 고정했다. 핸디한 책을 원하는 클라이언트의 요구를 수용해서 손에 잡힐 수 있는 가로 폭이 좁은 판형이다.',
    category: 'Graphic Design',
    client: ['백남준아트센터'],
    imageFolder: 'image/bc/백남준',
    imageBaseName: '백남준',
    imageCount: 9,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 6,
    title: '산산, 부서진 뒤 알게 된 것들',
    subtitle: ['포스터', '리플렛', '책'],
    year: '2018',
    specs: '무선제본',
    size: ['180x280mm', '114p'],
    description:
      '부서진 유물 조각을 의미를 찾는 전시의 포스터. 전시 제목을 부서진 유물조각으로 이미지화 했다.',
    category: 'Graphic Design',
    client: ['양주시립박물관'],
    imageFolder: 'image/bc/산산',
    imageBaseName: '산산',
    imageCount: 15,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 7,
    title: '도성의 수문',
    subtitle: ['포스터', '책'],
    year: '2019',
    specs: '무선제본',
    size: ['240x240mm', '62p'],
    description:
      '조선시대 도성의 수문에 관련된 전시의 도록. 내지와 표지의 푸른 수평선은 서울을 가로지르는 물길이다.',
    category: 'Graphic Design',
    client: ['한양도성박물관'],
    imageFolder: 'image/bc/도성',
    imageBaseName: '도성',
    imageCount: 9,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 8,
    title: '여주, 영릉을 품다',
    subtitle: ['포스터', '책'],
    year: '2022',
    specs: '무선제본',
    size: ['240x240mm', '128p'],
    description:
      '여주에 위치한 영릉에 관련된 전시의 도록.',
    category: 'Graphic Design',
    client: ['국립민속박물관'],
    imageFolder: 'image/bc/여주',
    imageBaseName: '여주',
    imageCount: 8,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 9,
    title: 'U+0338 : 슬러의 대모험',
    subtitle: ['포스터'],
    year: '2025',
    specs: '',
    size: '',
    description:
      '한국타이포그라피협회 전시 19 《그리드쉬프트》 출품 작업. &lt;U+0338 : 슬러의 대모험&gt;은 둘 이상의 대상을 대등하게 이어 주는 접속 조사 “~와”와 동일한 의미인 단어들를 조합해 만든 단 하나의 글자이다. 작업의 소재로 접속 조사 “와”를 사용한 이유는 글자들의 전시이자, 문장, 음률인 《그리드쉬프트》 속에서 다른 작업을 대등하게 이어주는 조사의 역할을 의도했기 때문이다. 작업 전 전시팀에서 제시한 Gridshift-Joyul.wav를 들었을 때 게임 음악을 연상했다. 픽셀 게임 <슈퍼마리오>에서 주인공 슈퍼마리오가 벽돌 위를 점프하며 게임을 전개하듯 ‘그리드쉬프트’라는 문장이자 음률을 이어가는 요소가 되고자 한다.',
    category: 'Graphic Design',
    client: ['한국타이포그라피협회'],
    imageFolder: 'image/2024/grid',
    imageBaseName: 'grid',
    imageCount: 1,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 10,
    title: '스마일딩벳폰트',
    subtitle: ['폰트'],
    year: '2022',
    specs: '',
    size: '',
    description:
      '기존 딩벳 폰트가 대부분 규칙성이 없음에서 착안, 한글의 규칙성을 딩벳 폰트에 적용했다. 스마일 형태를 유지하면서 초성은 스마일의 실루엣, 중성은 기울기, 종성은 스마일 속 눈의 형태를 한글의 초, 중, 종성 규칙을 따랐다. 초성과 중성에 들어가는 도형은 ●, ■, ⬟, ⬢, ▲이며 각각 여린 입천장 소리(ㄱ,ㄲ,ㅋ,ㅇ), 잇몸 소리(ㄴ, ㄷ, ㄸ, ㅌ, ㄹ, ㅅ, ㅆ), 입술 소리(ㅂ, ㅃ, ㅍ, ㅁ), 쎈 입천장 소리(ㅈ, ㅉ, ㅊ), 목청 소리(ㅎ)를 의미한다. ',
    category: 'Graphic Design',
    client: '개인작업, 과제',
    imageFolder: 'image/2024/스마일',
    imageBaseName: '스마일',
    imageCount: 14,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 11,
    title: '잊혀진 모든 것들을 위하여',
    subtitle: ['홍보물'],
    year: '2022',
    specs: '',
    size: '',
    description:
      '',
    category: 'Graphic Design',
    client: ['구로문화재단'],
    imageFolder: 'image/bc/구로',
    imageBaseName: '구로',
    imageCount: 3,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 12,
    title: '한국인의 일생',
    subtitle: ['책'],
    year: '2025',
    specs: '무선제본',
    size: '',
    description:
      '국립민속박물관 전시 도록 시안',
    category: 'Graphic Design',
    client: ['국립민속박물관'],
    imageFolder: 'image/2024/일생',
    imageBaseName: '일생',
    imageCount: 2,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 13,
    title: '훈민정음 천년의 문자계획',
    subtitle: ['책', '타이백'],
    year: '2020',
    specs: '소프트 양장제본',
    size: ['210x297mm', '326p'],
    description:
      '국립한글박물관 상설전시도록',
    category: 'Graphic Design',
    client: ['국립한글박물관'],
    imageFolder: 'image/bc/한박상설',
    imageBaseName: '한박상설',
    imageCount: 12,
    imageExt: 'jpg',
    padLength: 2
  },
  {
    id: 14,
    title: '강화의 포구',
    subtitle: ['책'],
    year: '2019',
    specs: '무선제본',
    size: ['190x260mm', '326p'],
    description:
      '황해도 지역의 강화도 섬을 조사한 민속 보고서. 메인 컬러는 황색(황해), 먹색(갯벌 진흙색). 내지는 그물을 모티브로 그리드를 설계했다. 도비라, 표지에도 그물 이미지를 연결했다.',
    category: 'Graphic Design',
    client: ['국립민속박물관'],
    imageFolder: 'image/bc/강화',
    imageBaseName: '강화',
    imageCount: 13,
    imageExt: 'jpg',
    padLength: 2
  },
  // ============================================
  // 새 프로젝트 추가 템플릿 예시
  // (필요할 때 아래 형식으로 하나 더 추가)
  // ============================================
  /*
  {
    id: 4,
    title: '프로젝트 제목',
    subtitle: '책',
    year: '2024',
    specs: '사양',
    size: '크기',
    description: '프로젝트 설명',
    category: 'Graphic Design',
    client: ['클라이언트'],

    // 실제 파일 이름:
    // image/2024/프로젝트폴더/프로젝트폴더_00.jpg ~ ...
    imageFolder: 'image/2024/프로젝트폴더',
    imageBaseName: '프로젝트폴더',
    imageCount: 5,   // 00~04 → 5장
    imageExt: 'jpg',
    padLength: 2
  }
  */
];

// ============================================
// 최종으로 사용할 projects 배열 생성
// - script.js에서는 이 projects만 사용하면 됨
// - 만약 어떤 프로젝트에 images 배열을 직접 넣고 싶으면
//   rawProjects 항목에 images: [...]를 추가하면 그걸 우선 사용.
// ============================================
const projects = rawProjects.map((p) => {
  let images = [];

  // 1) 혹시 수동으로 images를 직접 적어둔 경우 → 그대로 사용
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images;
  }
  // 2) 그 외에는 imageFolder / imageBaseName / imageCount 기준으로 자동 생성
  else if (p.imageFolder && p.imageBaseName && typeof p.imageCount === 'number') {
    images = generateImageArray(
      p.imageFolder,
      p.imageBaseName,
      p.imageCount,
      p.padLength || 2,
      p.imageExt || 'jpg'
    );
  }

  return {
    ...p,
    images
  };
});

// 디버그용: 브라우저 콘솔에서 확인 가능
console.log('최종 projects:', projects);
