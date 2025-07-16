import emailjs from '@emailjs/browser'

// Configurações do EmailJS
const EMAILJS_CONFIG = {
  serviceId: 'service_zpbmdnb',
  templateId: 'template_7sp3xwy', 
  publicKey: 'noOt_hhVThqPqV4E6'
}

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey)

export const sendSupportEmail = async (formData, userInfo) => {
  try {
    const templateParams = {
      nome: formData.name,
      email: formData.email,
      from_name: userInfo.name || userInfo.email,
      from_email: userInfo.email,
      to_email: 'suporte@direitoorganizado.com.br',
      subject: `[${formData.type.toUpperCase()}] ${formData.subject}`,
      mensagem: formData.message,
      type: formData.type,
      user_id: userInfo.id,
      timestamp: new Date().toLocaleString('pt-BR')
    }

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    )

    console.log('Email enviado com sucesso:', response)
    return { success: true, response }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error: error.text || error.message }
  }
}

export const sendAutoReplyEmail = async (userEmail, userName, subject) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      subject: `Re: ${subject}`,
      message: `Olá ${userName},

Recebemos sua mensagem e agradecemos por entrar em contato conosco.

Nossa equipe de suporte analisará sua solicitação e retornará em breve.

Tempo médio de resposta: 24 horas úteis.

Atenciosamente,
Equipe Direito Organizado`,
      timestamp: new Date().toLocaleString('pt-BR')
    }

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'auto_reply_template', // Template específico para auto-resposta
      templateParams
    )

    console.log('Auto-resposta enviada:', response)
    return { success: true, response }
  } catch (error) {
    console.error('Erro ao enviar auto-resposta:', error)
    return { success: false, error: error.text || error.message }
  }
}

// Função para configurar as credenciais do EmailJS
export const configureEmailJS = (serviceId, templateId, publicKey) => {
  EMAILJS_CONFIG.serviceId = serviceId
  EMAILJS_CONFIG.templateId = templateId
  EMAILJS_CONFIG.publicKey = publicKey
  
  // Reinicializar com a nova chave pública
  emailjs.init(publicKey)
}

