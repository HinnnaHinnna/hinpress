// ============================================
// projects-data.js
// ✅ 대표이미지(첫 번째 이미지) 크기 고정:
//    각 프로젝트에 mainImageSize: 's' | 'm' | 'l' 를 넣으면
//    상세 페이지 첫 이미지가 그 크기로 표시된다.
// ============================================

/**
 * 폴더 + 베이스 파일명 + 개수만으로 이미지 경로 배열 자동 생성
 */
function generateImageArray(folder, baseName, count, padLength = 2, ext = 'jpg') {
  const result = [];
  for (let i = 0; i < count; i++) {
    const indexStr = String(i).padStart(padLength, '0');

    let thisExt;
    if (Array.isArray(ext)) thisExt = ext[i] || ext[ext.length - 1] || 'jpg';
    else thisExt = ext || 'jpg';

    result.push(`${folder}/${baseName}_${indexStr}.${thisExt}`);
  }
  return result;
}

// ============================================
// 원본 프로젝트 데이터
// - mainImageSize: 's' | 'm' | 'l'
//   (여기서만 조절!)
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
      '본 책은 매체를 주요 소재로 삼아 ‘쓰기’라는 행위를 디자인에 대입해 사고의 전환을 시도하고, 코드를 매개로 새로운 커뮤니케이션 방식을 탐구한 연구의 기록이다. 표지의 검은 배경색은 전통적 쓰기를 상징하는 연필 흑심, 그 위에 선택적으로 유광 처리된 부분은 휴대전화 화면의 블랙 미러로서 매체를 상징한다.',
    category: 'Graphic Design',
    client: ['개인 작업, 서울시립대학교 디자인석사청구'],
    imageFolder: '2024/write',
    imageBaseName: 'write',
    span2Indexes: [5, 14],
    imageCount: 20,
    imageExt: 'jpg',
    padLength: 2,

    // ✅ 대표이미지 크기: 크게 보고 싶으면 'l'
    mainImageSize: 'l'
  },
  {
    id: 2,
    title: '심안',
    subtitle: '책',
    year: '2022',
    specs: '무선제본',
    size: ['125x130mm', '296p'],
    description:
      '일본 전통 공연인 라쿠고 &lt;심안&gt; 원문과 그 라쿠고를 리메이크한 일본 드라마 &lt;심안&gt; 자막으로 구성된 책이다. 등장인물은 총 4명이다. 표지 앞면은 3명의 등장 인물을 나타내는 지정색(주인공의 부인=미색, 게이샤=분홍색, 단골손님=녹색)을 그라데이션으로, 표지 뒷면은 장님인 주인공을 검은색 단면으로 표현했다. 이는 내지의 등장 인물 대사와 연결된다. 왼쪽 면은 주인공 한 명의 대사만, 오른쪽 면은 나머지 3명의 대사만이 나온다. 내지는 구조적으로 상하 구분되었다. 상단은 &lt;심안&gt;의 1930년대 최초 원문이, 하단은 드라마의 자막이 흐른다. 어떤 방식으로 읽든 독자의 영역이다. ',
    category: 'Graphic Design',
    client: ['개인 작업, 대학원 수업과제'],
    imageFolder: '2024/deepmind',
    imageBaseName: 'deepmind',
    span2Indexes: [5, 8],
    imageCount: 9,
    imageExt: 'jpg',
    padLength: 2,
    mainImageSize: 'l'
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
    imageFolder: '2024/achaive',
    imageBaseName: 'achaive',
    imageCount: 19,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
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
    client: ['충무로영화제-감독주간, box8'],
    imageFolder: '2024/parkchanwuk',
    imageBaseName: 'parkchanwuk',
    span2Indexes: [15], // parkchanwuk_15.jpg만 2칸(span:2)
    imageCount: 18,
    imageExt: 'jpg',
    padLength: 2,
    mainImageSize: 'l'
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
    imageFolder: 'bc/paeknamjune',
    imageBaseName: 'paeknamjune',
    imageCount: 9,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'm'
  },
  {
    id: 6,
    title: '산산, 부서진 뒤 알게 된 것들',
    subtitle: ['포스터', '리플렛', '책'],
    year: '2018',
    specs: '무선제본',
    size: ['180x280mm', '114p'],
    description:
      '부서진 유물 조각을 의미를 찾는 전시의 포스터. 전시 제목을 부서진 유물 조각으로 레터링 했다.',
    category: 'Graphic Design',
    client: ['양주시립박물관'],
    imageFolder: 'bc/sansan',
    imageBaseName: 'sansan',
    imageCount: 15,
    imageExt: 'jpg',
    padLength: 2,

    // 포스터류는 대표이미지를 작게 두고 싶으면 's'
    mainImageSize: 'l'
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
    imageFolder: 'bc/dosung',
    imageBaseName: 'dosung',
    imageCount: 9,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 8,
    title: '여주, 영릉을 품다',
    subtitle: ['포스터', '책'],
    year: '2022',
    specs: '무선제본',
    size: ['240x240mm', '128p'],
    description:
      '여주에 위치한 영릉에 관련된 전시의 도록. 무덤을 심볼화한 반원이 표지 후가공, 포스터 레터링, 하시라 등에 적용되었다.',
    category: 'Graphic Design',
    client: ['국립민속박물관'],
    imageFolder: 'bc/yeuju',
    imageBaseName: 'yeuju',
    imageCount: 8,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'm'
  },
  {
    id: 9,
    title: 'U+0338 : 슬러의 대모험',
    subtitle: ['포스터'],
    year: '2025',
    description:
      '한국타이포그라피협회 전시 19 《그리드쉬프트》 출품 작업. &lt;U+0338 : 슬러의 대모험&gt;은 둘 이상의 대상을 대등하게 이어 주는 접속 조사 “~와”와 동일한 의미인 단어들를 조합해 만든 단 하나의 글자이다. 작업의 소재로 접속 조사 “와”를 사용한 이유는 글자들의 전시이자, 문장, 음률인 《그리드쉬프트》 속에서 다른 작업을 대등하게 이어주는 조사의 역할을 의도했기 때문이다.',
    category: 'Graphic Design',
    client: ['한국타이포그라피협회'],
    imageFolder: '2024/grid',
    imageBaseName: 'grid',
    imageCount: 1,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 10,
    title: '스마일 딩벳폰트',
    subtitle: ['폰트'],
    year: '2022',
    description:
      '기존 딩벳 폰트가 대부분 규칙성이 없음에서 착안, 한글의 규칙성을 딩벳 폰트에 적용했다.',
    category: 'Graphic Design',
    client: '개인작업, 과제',
    imageFolder: '2024/smile',
    imageBaseName: 'smile',
    imageCount: 14,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 11,
    title: '잊혀진 모든 것들을 위하여',
    subtitle: ['홍보물'],
    year: '2022',
    description: '',
    category: 'Graphic Design',
    client: ['구로문화재단'],
    imageFolder: 'bc/kuro',
    imageBaseName: 'kuro',
    imageCount: 3,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 12,
    title: '한국인의 일생',
    subtitle: ['책'],
    year: '2025',
    specs: '무선제본',
    description: '국립민속박물관 전시 도록 시안. 표지 왼쪽 위에는 책 전체를 관통하는 구멍이 있다. 이 구멍에 일생을 상징하는 실이 통과하고 실은 책끈의 역할을 한다. 표지 디자인은 일생을 상징하는 실을 모티브로 레터링한 글자로 디자인했다. ',
    category: 'Graphic Design',
    client: ['국립민속박물관'],
    imageFolder: '2024/life',
    imageBaseName: 'life',
    imageCount: 2,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 13,
    title: '훈민정음 천년의 문자계획',
    subtitle: ['책', '타이백'],
    year: '2020',
    specs: '소프트 양장제본',
    size: ['210x297mm', '326p'],
    description: '국립한글박물관 상설전시도록',
    category: 'Graphic Design',
    client: ['국립한글박물관'],
    imageFolder: 'bc/hanguel',
    imageBaseName: 'hanguel',
    imageCount: 13,
    imageExt: 'jpg',
    padLength: 2,

    // ✅ 예시: 한글박물관 프로젝트는 대표이미지 크게
    mainImageSize: 'l'
  },
  {
    id: 14,
    title: '북촌 지역 보고서',
    subtitle: ['책'],
    year: '2020',
    specs: '소프트 양장제본',
    size: ['210x297mm'],
    description: '북촌 지역 보고서. 메인 컬러는 갈색(한옥 나무), 하늘색(하늘).',
    category: 'Graphic Design',
    client: ['서울역사박물관'],
    imageFolder: 'bc/bukchon',
    imageBaseName: 'bukchon',
    imageCount: 12,
    imageExt: 'jpg',
    padLength: 2,

    mainImageSize: 'l'
  },
  {
    id: 15,
    title: '2025 새해 인사',
    subtitle: ['그래픽'],
    year: '2025',
    specs: '웹',
    description: '푸른 (보아)뱀의 해. 2025! Happy new year!',
    category: 'Graphic Design',
    client: ['개인 작업'],
    imageFolder: '2024/2025year',
    imageBaseName: '2025year',
    imageCount: 2,
    imageExt: 'jpg',
    padLength: 2,
    mainImageSize: 'l'
  },
  {
    id: 16,
    title: 'xyz 워크샵 포스터',
    subtitle: ['포스터'],
    year: '2024',
    client: ['개인 작업'],
    description: '서울시립대학교 디자인전문대학원 시각디자인과 국외 디자이너 XYZ 랩: 자오완칭(Zhao Wanqing), 샤오녠(Shao Nian) 초빙 특강/워크숍 포스터. XYZ LAB의 의미가 LAB 컬러에서 온 것 같다 생각하여, LAB 컬러 x, y, z 좌표 축을 3차원 그래프로 표현했다.',
    category: 'Graphic Design',
    client: ['개인 작업'],
    imageFolder: '2024/xyz',
    imageBaseName: 'xyz',
    imageCount: 12,
    imageExt: ['gif', 'jpg'],
    padLength: 2,
    mainImageSize: 'l'
  },
  {
    id: 17,
    title: '입고 꾸미기 위한 공예',
    subtitle: ['포스터', '홍보물', '배너'],
    year: '2023',
    description: '<입고 꾸미기 위한 공예> 포스터. ',
    category: 'Graphic Design',
    client: ['서울공예박물관'],
    imageFolder: '2024/craftm',
    imageBaseName: 'craftm',
    span2Indexes: [1],
    imageCount: 4,
    imageExt: 'jpg',
    padLength: 2,
    mainImageSize: 'l'
  },
  {
    id: 18,
    title: '6699프레스 특강',
    subtitle: ['포스터', '배너'],
    year: '2022',
    description: '서울시립대학교 디자인전문대학원 시각디자인과 국내 디자이너 <6699프레스 특강> 포스터, 인스타 홍보물. 6699가 따옴표를 의미한다는 인터뷰를 보고 각 매체에 어울리게 6699를 표현했다.',
    category: 'Graphic Design',
    client: ['개인작업'],
    imageFolder: '2024/6699',
    imageBaseName: '6699',
    imageCount: 4,
    imageExt: ['gif', 'jpg'],
    padLength: 2,
    mainImageSize: 'l'
  },
  {
    id: 19,
    title: '메타공백',
    subtitle: ['웹'],
    year: '2025',
    description: '공백문자에는 빈 칸, 폭없는 공백, En Space, Punctuation Space 등 여러 종류의 공백문자가 있다. 비어있는 것처럼 보이지만 각각의 너비와 쓰임이 다르며 고유의 유니코드도 있는 모순적 문자이다. 이 모순적 특징을 주제 삼아 공백문자로만 단락을 섞어짜기 하려 했는데 작업 환경을 고려해 웹의 공백 기능 중 CSS 속성의 패딩과 블러도 추가 적용했다. ‘메타공백’은 공백이 아닌 공백으로 공백을 만들어가는 작업이다.',
    client: ['개인작업'],
    imageFolder: '2024/meta',
    imageBaseName: 'meta',
    imageCount: 4,
    imageExt: ['jpg'],
    padLength: 2,
    mainImageSize: 'l'
  }
];



// ============================================
// 최종 projects 배열 생성 (✅ span2Indexes 지원)
// ============================================
const projects = rawProjects.map((p) => {
  let images = [];

  // 1) 수동 images가 있으면 우선
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images;
  }
  // 2) 자동 생성
  else if (p.imageFolder && p.imageBaseName && typeof p.imageCount === 'number') {
    images = generateImageArray(
      p.imageFolder,
      p.imageBaseName,
      p.imageCount,
      p.padLength || 2,
      p.imageExt || 'jpg'
    );
  }

  // ✅ span2Indexes가 있으면 해당 인덱스만 { src, span:2 }로 변환
  if (Array.isArray(p.span2Indexes) && p.span2Indexes.length > 0) {
    images = images.map((item, idx) => {
      // item이 이미 객체면 그대로 둠(수동 images에서 객체를 넣었을 수도 있으니까)
      if (item && typeof item === 'object') return item;

      const isSpan2 = p.span2Indexes.includes(idx);
      return isSpan2 ? { src: item, span: 2 } : item;
    });
  }

  return { ...p, images };
});

// 디버그
console.log('최종 projects:', projects);

