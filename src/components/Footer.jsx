import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="app-footer">
      <p>{t('footer.text')}</p>
    </footer>
  )
}

export default Footer
