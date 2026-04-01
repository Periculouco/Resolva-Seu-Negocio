import type { FormEventHandler, MouseEventHandler } from "react";

import type { ContactTarget, FormData } from "../../types/domain";

type ContactModalProps = {
  isOpen: boolean;
  contactTarget: ContactTarget | null;
  formData: FormData;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUpdateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
};

export function ContactModal({
  isOpen,
  contactTarget,
  formData,
  onClose,
  onSubmit,
  onUpdateField,
}: ContactModalProps) {
  if (!isOpen || !contactTarget) {
    return null;
  }

  const stopPropagation: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={stopPropagation}
      >
        <div className="contact-modal-header">
          <div>
            <p className="section-kicker">Entrar em contato</p>
            <h2 id="contact-modal-title">{contactTarget.name}</h2>
            <p>{contactTarget.title}</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">
            ×
          </button>
        </div>

        <form className="contact-modal-form" onSubmit={onSubmit}>
          <label>
            Nome completo
            <input
              value={formData.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </label>
          <label>
            Email
            <input
              value={formData.email}
              onChange={(event) => onUpdateField("email", event.target.value)}
              placeholder="voce@empresa.com"
              type="email"
              required
            />
          </label>
          <label>
            Telefone
            <input
              value={formData.phone}
              onChange={(event) => onUpdateField("phone", event.target.value)}
              placeholder="(85) 99999-9999"
              required
            />
          </label>
          <label>
            Cargo
            <input
              value={formData.role}
              onChange={(event) => onUpdateField("role", event.target.value)}
              placeholder="Ex: CEO, diretora comercial, operações"
              required
            />
          </label>
          <label>
            Dor principal
            <textarea
              value={formData.mainPain}
              onChange={(event) => onUpdateField("mainPain", event.target.value)}
              placeholder="Descreva em poucas palavras o que mais está travando seu negócio hoje"
              required
            />
          </label>

          <div className="contact-modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              Enviar contato
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
