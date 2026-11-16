export type CategoryId = 'titles' | 'covers' | 'posters' | 'branding';

export type CategoryName =
  | 'Титры'
  | 'Музыкальные обложки'
  | 'Афиши'
  | 'Брендинг';

export interface PortfolioImage {
  src: string;
  full: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface TitleProject {
  id: string;
  title: string;
  category: 'Титры';
  description: string;
  video: string;
  poster: string;
  videoWidth: number;
  videoHeight: number;
  still: string;
  stillWidth: number;
  stillHeight: number;
  images: [PortfolioImage, ...PortfolioImage[]];
}

export interface GalleryProject {
  id: string;
  title?: string;
  category: Exclude<CategoryName, 'Титры'>;
  description: string;
  images: [PortfolioImage, ...PortfolioImage[]];
  layout?: 'featured' | 'wide' | 'tall' | 'normal';
}

export type AnyProject = TitleProject | GalleryProject;

export const TITLE_PROJECTS: TitleProject[] = [
  {
    id: 'title-1',
    title: 'LOVV66 — Не смотри в глаза',
    category: 'Титры',
    description: 'Вступительный титр к клипу с многослойной готической каллиграфией и резким гротеском.',
    video: '/media/titles/1/video.mp4',
    poster: '/media/titles/1/poster.webp',
    videoWidth: 960,
    videoHeight: 540,
    still: '/media/titles/1/still.webp',
    stillWidth: 1280,
    stillHeight: 960,
    images: [
      {
        src: '/media/titles/1/still.webp',
        full: '/media/titles/1/still.webp',
        width: 1280,
        height: 960,
        alt: 'Титр LOVV66 — Не смотри в глаза',
      },
    ],
  },
  {
    id: 'title-2',
    title: 'SODA LUV, PAPER ILLUSTRATOR — Аре5тантка',
    category: 'Титры',
    description: 'Плотная плакатная композиция титра с контрастным двуцветным акцентом для музыкального видео.',
    video: '/media/titles/2/video.mp4',
    poster: '/media/titles/2/poster.webp',
    videoWidth: 960,
    videoHeight: 536,
    still: '/media/titles/2/still.webp',
    stillWidth: 1280,
    stillHeight: 720,
    images: [
      {
        src: '/media/titles/2/still.webp',
        full: '/media/titles/2/still.webp',
        width: 1280,
        height: 720,
        alt: 'Титр SODA LUV, PAPER ILLUSTRATOR — Аре5тантка',
      },
    ],
  },
  {
    id: 'title-3',
    title: 'SEEMEE — Strip Club',
    category: 'Титры',
    description: 'Акцидентный леттеринг с силуэтной графикой и винтажной пластикой букв.',
    video: '/media/titles/3/video.mp4',
    poster: '/media/titles/3/poster.webp',
    videoWidth: 960,
    videoHeight: 720,
    still: '/media/titles/3/still.webp',
    stillWidth: 1280,
    stillHeight: 915,
    images: [
      {
        src: '/media/titles/3/still.webp',
        full: '/media/titles/3/still.webp',
        width: 1280,
        height: 915,
        alt: 'Титр SEEMEE — Strip Club',
      },
    ],
  },
  {
    id: 'title-4',
    title: 'DooMee, YUNGWAY — UP',
    category: 'Титры',
    description: 'Сверхширокий минималистичный титр с мягким свечением и кинематографичной версткой.',
    video: '/media/titles/4/video.mp4',
    poster: '/media/titles/4/poster.webp',
    videoWidth: 960,
    videoHeight: 540,
    still: '/media/titles/4/still.webp',
    stillWidth: 1280,
    stillHeight: 720,
    images: [
      {
        src: '/media/titles/4/still.webp',
        full: '/media/titles/4/still.webp',
        width: 1280,
        height: 720,
        alt: 'Титр DooMee, YUNGWAY — UP',
      },
    ],
  },
  {
    id: 'title-5',
    title: 'ivanzolo2004 — Баобаб',
    category: 'Титры',
    description: 'Экспериментальная рисованная типографика с рваным текстурным контуром.',
    video: '/media/titles/5/video.mp4',
    poster: '/media/titles/5/poster.webp',
    videoWidth: 960,
    videoHeight: 528,
    still: '/media/titles/5/still.webp',
    stillWidth: 1280,
    stillHeight: 1024,
    images: [
      {
        src: '/media/titles/5/still.webp',
        full: '/media/titles/5/still.webp',
        width: 1280,
        height: 1024,
        alt: 'Титр ivanzolo2004 — Баобаб',
      },
    ],
  },
  {
    id: 'title-6',
    title: '5LUV5 — Надежда Бабкина',
    category: 'Титры',
    description: 'Многострочная журнально-типографская сетка с антиквенным набором и линейками.',
    video: '/media/titles/6/video.mp4',
    poster: '/media/titles/6/poster.webp',
    videoWidth: 960,
    videoHeight: 720,
    still: '/media/titles/6/still.webp',
    stillWidth: 1280,
    stillHeight: 960,
    images: [
      {
        src: '/media/titles/6/still.webp',
        full: '/media/titles/6/still.webp',
        width: 1280,
        height: 960,
        alt: 'Титр 5LUV5 — Надежда Бабкина',
      },
    ],
  },
  {
    id: 'title-7',
    title: 'YOGAS WHYSTI — IG',
    category: 'Титры',
    description: 'Строгая монограмма с высоким контрастом штрихов для вступительной сцены клипа.',
    video: '/media/titles/7/video.mp4',
    poster: '/media/titles/7/poster.webp',
    videoWidth: 960,
    videoHeight: 720,
    still: '/media/titles/7/still.webp',
    stillWidth: 1280,
    stillHeight: 720,
    images: [
      {
        src: '/media/titles/7/still.webp',
        full: '/media/titles/7/still.webp',
        width: 1280,
        height: 720,
        alt: 'Титр YOGAS WHYSTI — IG',
      },
    ],
  },
  {
    id: 'title-8',
    title: 'LOVV66 — GLORYLIGION 2 BONUS',
    category: 'Титры',
    description: 'Арочный ретро-титр для двойного видеоклипа «Буду делать / Не попрощався».',
    video: '/media/titles/8/video.mp4',
    poster: '/media/titles/8/poster.webp',
    videoWidth: 960,
    videoHeight: 538,
    still: '/media/titles/8/still.webp',
    stillWidth: 1280,
    stillHeight: 720,
    images: [
      {
        src: '/media/titles/8/still.webp',
        full: '/media/titles/8/still.webp',
        width: 1280,
        height: 720,
        alt: 'Титр LOVV66 — GLORYLIGION 2 BONUS',
      },
    ],
  },
  {
    id: 'title-9',
    title: 'YOGAS — 2k17 Сохраненка',
    category: 'Титры',
    description: 'Вытянутая арочная типографика во весь кадр с мягким свечением контура.',
    video: '/media/titles/9/video.mp4',
    poster: '/media/titles/9/poster.webp',
    videoWidth: 848,
    videoHeight: 636,
    still: '/media/titles/9/still.webp',
    stillWidth: 1280,
    stillHeight: 960,
    images: [
      {
        src: '/media/titles/9/still.webp',
        full: '/media/titles/9/still.webp',
        width: 1280,
        height: 960,
        alt: 'Титр YOGAS — 2k17 Сохраненка',
      },
    ],
  },
];

export const COVER_PROJECTS: GalleryProject[] = [
  {
    id: 'cover-1',
    category: 'Музыкальные обложки',
    description: 'Готическая обложка релиза с силуэтом старинного замка и мистическим персонажем на лестнице.',
    images: [
      {
        src: '/media/covers/thumb/img-0290.webp',
        full: '/media/covers/img-0290.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 01',
      },
    ],
  },
  {
    id: 'cover-2',
    category: 'Музыкальные обложки',
    description: 'Металлическая панель кнопок и массивный хромированный логотип с крестом.',
    images: [
      {
        src: '/media/covers/thumb/img-0361.webp',
        full: '/media/covers/img-0361.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 02',
      },
    ],
  },
  {
    id: 'cover-3',
    category: 'Музыкальные обложки',
    description: 'Мрачный фактурный коллаж с зернистой обработкой и многослойным граффити-фоном.',
    images: [
      {
        src: '/media/covers/thumb/img-4128.webp',
        full: '/media/covers/img-4128.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 03',
      },
    ],
  },
  {
    id: 'cover-4',
    category: 'Музыкальные обложки',
    description: 'Высококонтрастная черно-белая обложка с акцентом на ювелирную подвеску.',
    images: [
      {
        src: '/media/covers/thumb/img-7332.webp',
        full: '/media/covers/img-7332.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 04',
      },
    ],
  },
  {
    id: 'cover-5',
    category: 'Музыкальные обложки',
    description: 'Сюрреалистичный плакатный коллаж с резким контрастом и крупным взглядом на фоне звезды.',
    images: [
      {
        src: '/media/covers/thumb/img-7334.webp',
        full: '/media/covers/img-7334.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 05',
      },
    ],
  },
  {
    id: 'cover-6',
    category: 'Музыкальные обложки',
    description: 'Тревожный хоррор-кадр с эффектом старой VHS-камеры и скрытым силуэтом на заднем плане.',
    images: [
      {
        src: '/media/covers/thumb/img-7335.webp',
        full: '/media/covers/img-7335.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 06',
      },
    ],
  },
  {
    id: 'cover-7',
    category: 'Музыкальные обложки',
    description: 'Хромированный барельеф и композиция из металлических осколков (prod. by flextrik).',
    images: [
      {
        src: '/media/covers/thumb/img-7336.webp',
        full: '/media/covers/img-7336.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 07',
      },
    ],
  },
  {
    id: 'cover-8',
    category: 'Музыкальные обложки',
    description: 'Сумеречный фотоколлаж с вытянутой полупрозрачной типографикой и подписью «экскейп».',
    images: [
      {
        src: '/media/covers/thumb/img-7337.webp',
        full: '/media/covers/img-7337.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 08',
      },
    ],
  },
  {
    id: 'cover-9',
    category: 'Музыкальные обложки',
    description: 'Сюрреалистический 3D-силуэт из переплетенных нитей и дымки.',
    images: [
      {
        src: '/media/covers/thumb/img-7338.webp',
        full: '/media/covers/img-7338.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 09',
      },
    ],
  },
  {
    id: 'cover-10',
    category: 'Музыкальные обложки',
    description: 'Атмосферная обложка со смазанным движением и классической антиквой.',
    images: [
      {
        src: '/media/covers/thumb/img-7339.webp',
        full: '/media/covers/img-7339.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 10',
      },
    ],
  },
  {
    id: 'cover-11',
    category: 'Музыкальные обложки',
    description: 'Объемная типографика из светящихся кубов в перспективе ночного зала.',
    images: [
      {
        src: '/media/covers/thumb/img-7340.webp',
        full: '/media/covers/img-7340.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 11',
      },
    ],
  },
  {
    id: 'cover-12',
    category: 'Музыкальные обложки',
    description: 'Дарк-аниме иллюстрация с вертикальной журнальной версткой и контурным титулом.',
    images: [
      {
        src: '/media/covers/thumb/img-7341.webp',
        full: '/media/covers/img-7341.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 12',
      },
    ],
  },
  {
    id: 'cover-13',
    category: 'Музыкальные обложки',
    description: 'Контрастный портрет с ручным аэрограф-леттерингом.',
    images: [
      {
        src: '/media/covers/thumb/img-7342.webp',
        full: '/media/covers/img-7342.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 13',
      },
    ],
  },
  {
    id: 'cover-14',
    category: 'Музыкальные обложки',
    description: 'Выжженный черно-белый постерный стиль с массивной сжатой антиквой.',
    images: [
      {
        src: '/media/covers/thumb/img-7343.webp',
        full: '/media/covers/img-7343.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 14',
      },
    ],
  },
  {
    id: 'cover-15',
    category: 'Музыкальные обложки',
    description: 'Гламур-панк обложка с сочетанием рукописной каллиграфии и чистого гротеска.',
    images: [
      {
        src: '/media/covers/thumb/img-7344.webp',
        full: '/media/covers/img-7344.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 15',
      },
    ],
  },
  {
    id: 'cover-16',
    category: 'Музыкальные обложки',
    description: 'Кинематографичная постановка кадра с дымовой типографикой на фоне неба.',
    images: [
      {
        src: '/media/covers/thumb/img-7347.webp',
        full: '/media/covers/img-7347.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 16',
      },
    ],
  },
  {
    id: 'cover-17',
    category: 'Музыкальные обложки',
    description: 'Макро-портрет в глубокой тени с акцентом на готический шрифт.',
    images: [
      {
        src: '/media/covers/thumb/img-7348.webp',
        full: '/media/covers/img-7348.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 17',
      },
    ],
  },
  {
    id: 'cover-18',
    category: 'Музыкальные обложки',
    description: 'Графическая оптическая иллюзия в чистом черно-белом силуэте.',
    images: [
      {
        src: '/media/covers/thumb/img-7349.webp',
        full: '/media/covers/img-7349.webp',
        width: 1600,
        height: 1600,
        alt: 'Музыкальная обложка № 18',
      },
    ],
  },
  {
    id: 'cover-19',
    category: 'Музыкальные обложки',
    description: 'Детализированная ночная сцена под грозой с неоновой вывеской.',
    images: [
      {
        src: '/media/covers/thumb/img-7352.webp',
        full: '/media/covers/img-7352.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 19',
      },
    ],
  },
  {
    id: 'cover-20',
    category: 'Музыкальные обложки',
    description: 'Металлический 3D-леттеринг с шипами и мягким свечением.',
    images: [
      {
        src: '/media/covers/thumb/img-7353.webp',
        full: '/media/covers/img-7353.webp',
        width: 1280,
        height: 1280,
        alt: 'Музыкальная обложка № 20',
      },
    ],
  },
];

export const POSTER_PROJECTS: GalleryProject[] = [
  {
    id: 'poster-1',
    title: 'JDFLAG MOSKVA — PIPL 29.11',
    category: 'Афиши',
    description: 'Концертная афиша московского выступления JDFLAG (при участии DJ DAILY SLIME) с расколотым портретом и гранжевой версткой.',
    layout: 'tall',
    images: [
      {
        src: '/media/posters/thumb/img-2223.webp',
        full: '/media/posters/img-2223.webp',
        width: 960,
        height: 1280,
        alt: 'Афиша JDFLAG MOSKVA — PIPL 29.11',
      },
    ],
  },
  {
    id: 'poster-2',
    title: 'SCREAMSHARE — 02.03 (GORKA ZOLOTAYA)',
    category: 'Афиши',
    description: 'Светлая постерная композиция с баббл-граффити тегом SCREAMSHARE и четкой журнальной сеткой даты и локации.',
    layout: 'featured',
    images: [
      {
        src: '/media/posters/thumb/img-2224.webp',
        full: '/media/posters/img-2224.webp',
        width: 1280,
        height: 1280,
        alt: 'Афиша SCREAMSHARE — 02.03',
      },
    ],
  },
  {
    id: 'poster-3',
    title: 'Marcelo Miracles — KISSME+PARTY',
    category: 'Афиши',
    description: 'Клубная афиша вечеринки KISSME+PARTY с лаконичным центральным титром и расписанием артистов.',
    layout: 'tall',
    images: [
      {
        src: '/media/posters/thumb/img-7364.webp',
        full: '/media/posters/img-7364.webp',
        width: 1024,
        height: 1280,
        alt: 'Афиша Marcelo Miracles — KISSME+PARTY',
      },
    ],
  },
];

export const BRANDING_PROJECTS: GalleryProject[] = [
  {
    id: 'branding-soda-luv',
    title: 'SODA LUV — Оформление выпуска «IDIOCRACY TV»',
    category: 'Брендинг',
    description: 'Комплексный визуальный пакет к презентации альбома IDIOCRACY: обложка выпуска, телевизионная эфирная графика с плашками гостей и финальная заставка с QR-кодом.',
    layout: 'featured',
    images: [
      {
        src: '/media/branding/soda-luv/thumb/prevyu.webp',
        full: '/media/branding/soda-luv/prevyu.webp',
        width: 1280,
        height: 720,
        alt: 'SODA LUV — Превью выпуска «Презентация альбома IDIOCRACY»',
        caption: 'Главное превью выпуска «Презентация альбома»',
      },
      {
        src: '/media/branding/soda-luv/thumb/gosti.webp',
        full: '/media/branding/soda-luv/gosti.webp',
        width: 1920,
        height: 1080,
        alt: 'SODA LUV — Эфирный титр гостя IDIOCRACY TV',
        caption: 'Эфирное оформление и титр гостя в стилистике телеканала IDIOCRACY TV',
      },
      {
        src: '/media/branding/soda-luv/thumb/h.webp',
        full: '/media/branding/soda-luv/h.webp',
        width: 1280,
        height: 720,
        alt: 'SODA LUV — Заставка «Слушай альбом IDIOCRACY»',
        caption: 'Финальная заставка выпуска с промо-кодом альбома',
      },
    ],
  },
  {
    id: 'branding-jdflag',
    title: 'JDFLAG — Мерч и баннер розыгрыша',
    category: 'Брендинг',
    description: 'Разработка линейки футболок с техникой анти-вышивки, фирменной монограммой JDF и дизайном CD-носителя для промо-кампании артиста.',
    layout: 'wide',
    images: [
      {
        src: '/media/branding/visual/thumb/img-1669.webp',
        full: '/media/branding/visual/img-1669.webp',
        width: 1920,
        height: 1080,
        alt: 'JDFLAG — Концепт футболок и техника анти-вышивки',
        caption: 'Линейка футболок JDFLAG с техникой анти-вышивки',
      },
      {
        src: '/media/branding/visual/thumb/img-2226.webp',
        full: '/media/branding/visual/img-2226.webp',
        width: 1280,
        height: 1130,
        alt: 'JDFLAG — Оформление CD и баннер розыгрыша',
        caption: 'Оформление физического CD-диска и баннера розыгрыша JDFLAG',
      },
    ],
  },
  {
    id: 'branding-cocala',
    title: 'Баннер мерча',
    category: 'Брендинг',
    description: 'Айдентика и презентационный лист коллекции футболок и аксессуаров в четырёх цветовых решениях с ироничным переосмыслением классического логотипа.',
    layout: 'normal',
    images: [
      {
        src: '/media/branding/visual/thumb/img-1671.webp',
        full: '/media/branding/visual/img-1671.webp',
        width: 1200,
        height: 1280,
        alt: 'Баннер мерча',
        caption: 'Баннер мерча',
      },
    ],
  },
  {
    id: 'branding-budu-delat',
    title: 'LOVV66 - БУДУ ДЕЛАТЬ | Превью',
    category: 'Брендинг',
    description: 'Ключевой широкоформатный промо-кадр с кракелюрной сверхвысокой типографикой для визуального сопровождения релиза.',
    layout: 'normal',
    images: [
      {
        src: '/media/branding/visual/thumb/img-7370.webp',
        full: '/media/branding/visual/img-7370.webp',
        width: 2200,
        height: 1238,
        alt: 'LOVV66 - БУДУ ДЕЛАТЬ | Превью',
        caption: 'LOVV66 - БУДУ ДЕЛАТЬ | Превью',
      },
    ],
  },
];

export const COLLABORATION_TEXT =
  'Среди тех, с кем я работал: SODA LUV, LOVV66, JDFLAG, ivanzolo2004, Marcelo Miracles, SEEMEE, DooMee, YUNGWAY, ТРАВМА и другие';

export interface SocialChannel {
  label: string;
  url: string;
  handle: string;
}

export const CONTACTS_DATA: {
  heading: string;
  orderTelegram: SocialChannel;
  email: { label: string; address: string; mailto: string };
  instagram: SocialChannel;
  channelTelegram: SocialChannel;
} = {
  heading: 'Мои контакты',
  orderTelegram: {
    label: 'Telegram для заказов',
    url: 'https://t.me/takehisfuckingsoul',
    handle: '@takehisfuckingsoul',
  },
  email: {
    label: 'Почта',
    address: 'exckapeasfuck@gmail.com',
    mailto: 'mailto:exckapeasfuck@gmail.com',
  },
  instagram: {
    label: 'Instagram',
    url: 'https://www.instagram.com/exckapefucku/',
    handle: '@exckapefucku',
  },
  channelTelegram: {
    label: 'Telegram',
    url: 'https://t.me/exckapefucku',
    handle: '@exckapefucku',
  },
};
