// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_PAGES = '/pages';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  forgotPassword: path(ROOTS_AUTH, '/forgot-password'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components'
};

export const PATH_PAGES = {
  root: ROOTS_PAGES,
  general: {
    app: path(ROOTS_PAGES, '/app'),
    ecommerce: path(ROOTS_PAGES, '/ecommerce'),
    analytics: path(ROOTS_PAGES, '/analytics')
  },
  mail: {
    root: path(ROOTS_PAGES, '/mail'),
    all: path(ROOTS_PAGES, '/mail/all')
  },
  chat: {
    root: path(ROOTS_PAGES, '/chat'),
    new: path(ROOTS_PAGES, '/chat/new'),
    conversation: path(ROOTS_PAGES, '/chat/:conversationKey')
  },
  calendar: path(ROOTS_PAGES, '/calendar'),
  kanban: path(ROOTS_PAGES, '/kanban'),
  user: {
    root: path(ROOTS_PAGES, '/user'),
    profile: path(ROOTS_PAGES, '/user/profile'),
    cards: path(ROOTS_PAGES, '/user/cards'),
    list: path(ROOTS_PAGES, '/user/list'),
    newUser: path(ROOTS_PAGES, '/user/new'),
    editById: path(ROOTS_PAGES, '/user/ada-lindgren/edit'),
    account: path(ROOTS_PAGES, '/user/account')
  },
  eCommerce: {
    root: path(ROOTS_PAGES, '/e-commerce'),
    shop: path(ROOTS_PAGES, '/e-commerce/shop'),
    product: path(ROOTS_PAGES, '/e-commerce/product/:name'),
    productById: path(ROOTS_PAGES, '/e-commerce/product/nike-air-force-1-ndestrukt'),
    list: path(ROOTS_PAGES, '/e-commerce/list'),
    newProduct: path(ROOTS_PAGES, '/e-commerce/product/new'),
    editById: path(ROOTS_PAGES, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    checkout: path(ROOTS_PAGES, '/e-commerce/checkout'),
    invoice: path(ROOTS_PAGES, '/e-commerce/invoice')
  },
  blog: {
    root: path(ROOTS_PAGES, '/blog'),
    posts: path(ROOTS_PAGES, '/blog/posts'),
    post: path(ROOTS_PAGES, '/blog/post/:title'),
    postById: path(ROOTS_PAGES, '/blog/post/portfolio-review-is-this-portfolio-too-creative'),
    newPost: path(ROOTS_PAGES, '/blog/new-post')
  },
  pages: {
    root: path(ROOTS_PAGES, '/C002000'),
    page404: path(ROOTS_PAGES, '/404'),
    C001001: path(ROOTS_PAGES, '/C001001'),
    C002002: path(ROOTS_PAGES, '/C002002'),
    C002003: path(ROOTS_PAGES, '/C002003'),
    C002004: path(ROOTS_PAGES, '/C002004'),
    SM02010102: path(ROOTS_PAGES, '/SM02010102'),
    MD01010101: path(ROOTS_PAGES, '/MD01010101'),
    MD01010100: path(ROOTS_PAGES, '/MD01010100'),
    SM01010101: path(ROOTS_PAGES, '/SM01010101'),
    SM01010201: path(ROOTS_PAGES, '/SM01010201'),
    MD01020501: path(ROOTS_PAGES, '/MD01020501'),
    MD01020502: path(ROOTS_PAGES, '/MD01020502'),
    MD01020102: path(ROOTS_PAGES, '/MD01020102'),
    MD01050101: path(ROOTS_PAGES, '/MD01050101'),
    MD01020101: path(ROOTS_PAGES, '/MD01020101'),
    MD01010201: path(ROOTS_PAGES, '/MD01010201'),
    MD01010202: path(ROOTS_PAGES, '/MD01010202'),
    SM01010100: path(ROOTS_PAGES, '/SM01010100'),
    MD01010204: path(ROOTS_PAGES, '/MD01010204'),
    MD01020104: path(ROOTS_PAGES, '/MD01020104'),
    PP01020101: path(ROOTS_PAGES, '/PP01020101'),
    PP04040101: path(ROOTS_PAGES, '/PP04040101'),
    MD03010101: path(ROOTS_PAGES, '/MD03010101'),
    MD03010102: path(ROOTS_PAGES, '/MD03010102'),
    PP04010101: path(ROOTS_PAGES, '/PP04010101'),
    MD01040401: path(ROOTS_PAGES, '/MD01040401'),
    MD01050203: path(ROOTS_PAGES, '/MD01050203'),
    PP05010201: path(ROOTS_PAGES, '/PP05010201'),
    PP02040101: path(ROOTS_PAGES, '/PP02040101'),
    SM01010302: path(ROOTS_PAGES, '/SM01010302'),
    MD01030201: path(ROOTS_PAGES, '/MD01030201'),
    MD01030202: path(ROOTS_PAGES, '/MD01030202'),
    MD01030301: path(ROOTS_PAGES, '/MD01030301'),
    MD01030101: path(ROOTS_PAGES, '/MD01030101'),
  }
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';
