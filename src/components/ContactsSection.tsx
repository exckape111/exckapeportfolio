import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COLLABORATION_TEXT, CONTACTS_DATA, SocialChannel } from '../data/projects';
import { CornerArrow, IntertitleFlourish } from './VintageOrnaments';
import { ClipboardService, TextClipboard } from '../services/ClipboardService';

const defaultClipboard = new ClipboardService();

interface ContactsSectionProps {
  clipboard?: TextClipboard;
}

const SocialRow: React.FC<{ channel: SocialChannel }> = ({ channel }) => (
  <div className="contact-row">
    <span className="contact-row__label">{channel.label}</span>
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-row__link"
      data-cursor="hover"
    >
      {channel.handle}
    </a>
  </div>
);

export const ContactsSection: React.FC<ContactsSectionProps> = ({ clipboard = defaultClipboard }) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const handleCopyEmail = async () => {
    const didCopy = await clipboard.copy(CONTACTS_DATA.email.address);
    setCopied(didCopy);
    setCopyFailed(!didCopy);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopied(false);
      setCopyFailed(false);
    }, 3200);
  };

  return (
    <>
      <p className="collaboration-line">{COLLABORATION_TEXT}</p>

      <motion.footer
        id="contacts"
        className="contacts-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        aria-labelledby="contacts-heading"
      >
        <div className="contacts-card">
          <CornerArrow position="tl" />
          <CornerArrow position="tr" />
          <CornerArrow position="bl" />
          <CornerArrow position="br" />

          <IntertitleFlourish className="contacts-card__flourish" />

          <span className="contacts-card__reel">ФИНАЛЬНЫЙ ТИТР • КОНТАКТЫ</span>

          <h2 id="contacts-heading" className="contacts-card__title">
            {CONTACTS_DATA.heading}
          </h2>

          <div className="contacts-grid">
            <SocialRow channel={CONTACTS_DATA.orderTelegram} />

            <div className="contact-row contact-row--email">
              <span className="contact-row__label">{CONTACTS_DATA.email.label}</span>
              <div className="contact-row__email-actions">
                <a
                  href={CONTACTS_DATA.email.mailto}
                  className="contact-row__link"
                  data-cursor="hover"
                >
                  {CONTACTS_DATA.email.address}
                </a>
                <button
                  type="button"
                  className={`copy-email-btn ${copied ? 'copy-email-btn--copied' : ''}`}
                  onClick={handleCopyEmail}
                  data-cursor="hover"
                  aria-live="polite"
                >
                  {copied ? 'Почта скопирована ✓' : 'Скопировать почту'}
                </button>
              </div>
            </div>

            <SocialRow channel={CONTACTS_DATA.instagram} />
            <SocialRow channel={CONTACTS_DATA.channelTelegram} />
          </div>

          {copied && (
            <div className="copy-toast" role="status" aria-live="polite">
              Адрес <strong>{CONTACTS_DATA.email.address}</strong> скопирован в буфер обмена
            </div>
          )}
          {copyFailed && (
            <div className="copy-toast" role="status">
              Не удалось скопировать адрес. Выделите и скопируйте почту вручную.
            </div>
          )}

          <IntertitleFlourish flip className="contacts-card__flourish" />

          <div className="contacts-footer-sign">
            <a href="#top" className="contacts-back-top" data-cursor="hover">
              К началу плёнки ↑
            </a>
          </div>
        </div>
      </motion.footer>
    </>
  );
};

export default ContactsSection;
