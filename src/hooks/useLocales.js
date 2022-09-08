import { useTranslation } from 'react-i18next';
// material
import { enUS, koKR, viVN } from '@material-ui/core/locale';

// ----------------------------------------------------------------------

const LANGS = [
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: '/static/icons/ic_flag_en.svg'
  },
  {
    label: '한국어',
    value: 'kr',
    systemValue: koKR,
    icon: '/static/icons/ic_flags_kr.svg'
  },
  {
    label: 'Tiếng Việt',
    value: 'vi',
    systemValue: viVN,
    icon: '/static/icons/ic_flag_vn.svg'
  }
];

export default function useLocales() {
  const { i18n, t: translate } = useTranslation();
  const langStorage = localStorage.getItem('i18nextLng');
  const currentLang = LANGS.find((_lang) => _lang.value === langStorage) || LANGS[0];

  const handleChangeLanguage = (newlang) => {
    i18n.changeLanguage(newlang);
  };

  return {
    onChangeLang: handleChangeLanguage,
    translate,
    currentLang,
    allLang: LANGS
  };
}
