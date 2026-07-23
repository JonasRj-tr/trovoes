import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Award, 
  Activity, 
  Ruler, 
  Scale, 
  FileText, 
  Printer, 
  Zap, 
  Check, 
  CheckCircle,
  FileUp,
  Sparkles,
  Eye,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { Player, RegistrationStatus } from '../types';
import { calculateAge, formatDateBR, printReport } from '../lib/utils';
import { db, doc, updateDoc } from '../lib/firebase';

interface PlayerProfileModalProps {
  player: Player | null;
  onClose: () => void;
  isAdmin: boolean;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  onClose,
  isAdmin
}) => {
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  if (!player) return null;

  const age = calculateAge(player.birthDate);

  const handleUpdateStatus = async (status: RegistrationStatus) => {
    try {
      await updateDoc(doc(db, 'players', player.id), { status });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Generate HTML for Full Athlete Form + Guardian Consent Term
  const getFullFormHtml = () => {
    const guardian = player.guardians?.[0];
    const signatureImg = player.minorAuthorization?.signatureDataUrl;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111; padding: 20px; line-height: 1.4;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #0A111E; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 22px; color: #0A111E; font-weight: 900; text-transform: uppercase;">
            ⚡ ASSOCIAÇÃO ESPORTIVA TROVOES
          </h1>
          <h2 style="margin: 4px 0 0 0; font-size: 14px; color: #FF6600; font-weight: bold; text-transform: uppercase;">
            FICHA OFICIAL DE INSCRIÇÃO DO ATLETA E TERMO LEGAL DE RESPONSABILIDADE
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">
            Data do Registro: ${formatDateBR(player.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10))} | Status: <strong>${player.status.toUpperCase()}</strong>
          </p>
        </div>

        <!-- Section 1: Athlete Personal Data & Photo -->
        <div style="display: flex; gap: 20px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="width: 120px; text-align: center; flex-shrink: 0;">
            <img src="${player.photoUrl}" style="width: 110px; height: 110px; border-radius: 12px; object-fit: cover; border: 2px solid #0A111E;" />
            <div style="margin-top: 6px; font-size: 10px; font-weight: bold; background: #0A111E; color: #FFCC00; padding: 3px 6px; border-radius: 6px;">
              ${player.category}
            </div>
          </div>
          <div style="flex: 1; font-size: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0A111E; font-weight: 800;">${player.fullName}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <tr>
                <td style="padding: 3px 0;"><strong>Posição:</strong> ${player.position}</td>
                <td style="padding: 3px 0;"><strong>Pé Dominante:</strong> ${player.dominantFoot}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0;"><strong>Data de Nasc.:</strong> ${formatDateBR(player.birthDate)} (${age} anos)</td>
                <td style="padding: 3px 0;"><strong>RG / CPF:</strong> ${player.rgCpf}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0;"><strong>Telefone Atleta:</strong> ${player.phone || 'Não informado'}</td>
                <td style="padding: 3px 0;"><strong>Clube Anterior:</strong> ${player.previousClub || 'Nenhum'}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 3px 0;"><strong>Endereço Residencial:</strong> ${player.address || 'Não informado'}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Section 2: Biometrics & Medical -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0A111E; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase;">
            📊 Dados Biométricos e Histórico Físico
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #cbd5e1;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Altura</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Peso</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Histórico de Lesões / Cuidados Médicos</th>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${player.height} cm</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${player.weight} kg</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${player.injuryHistory || 'Sem histórico de lesões informado.'}</td>
            </tr>
          </table>
        </div>

        <!-- Section 3: Legal Guardians -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0A111E; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase;">
            👨‍👩‍👦 Responsável Legal do Atleta
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #cbd5e1;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Nome do Responsável</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Parentesco</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">CPF</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Telefone WhatsApp</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">E-mail</th>
            </tr>
            ${player.guardians?.map(g => `
              <tr>
                <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${g.name}</strong></td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${g.relationship}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${g.cpf}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${g.phone}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${g.email || 'N/A'}</td>
              </tr>
            `).join('') || `<tr><td colspan="5" style="padding:6px;">Nenhum responsável informado.</td></tr>`}
          </table>
        </div>

        <!-- Section 4: Legal Consent Term -->
        <div style="margin-bottom: 20px; border: 2px solid #FF6600; padding: 15px; border-radius: 8px; background: #fffcf8;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #FF6600; text-transform: uppercase; font-weight: 800;">
            📝 TERMO DE AUTORIZAÇÃO E RESPONSABILIDADE LEGAL DO MENOR
          </h4>
          <p style="font-size: 11px; color: #334155; line-height: 1.5; margin-bottom: 12px; font-style: italic;">
            "${player.minorAuthorization?.legalText || 'Eu, na qualidade de responsável legal, autorizo expressamente a participação do atleta menor de idade no time TROVOES...'}"
          </p>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; pt-10; border-top: 1px dashed #cbd5e1;">
            <div>
              <p style="font-size: 10px; color: #64748b; margin: 0;">
                Data do aceite digital: <strong>${player.minorAuthorization?.date || formatDateBR(player.createdAt?.substring(0, 10) || '')}</strong>
              </p>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">
                CPF do Responsável Declarante: <strong>${player.minorAuthorization?.guardianCpf || guardian?.cpf || 'N/I'}</strong>
              </p>
            </div>

            <div style="text-align: center; min-width: 250px;">
              ${signatureImg ? `
                <img src="${signatureImg}" style="max-height: 60px; max-width: 200px; display: block; margin: 0 auto 4px auto;" />
              ` : `
                <div style="height: 50px;"></div>
              `}
              <div style="border-top: 1px solid #000; font-size: 10px; font-weight: bold; margin-top: 4px; padding-top: 2px;">
                Assinatura do Responsável Legal<br/>
                <span style="font-weight: normal; color: #555;">${guardian?.name || 'Responsável Legal'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Official Stamp Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 10px; border-top: 2px solid #0A111E; font-size: 10px; color: #64748b;">
          <div>
            Associação Esportiva TROVOES • Documento gerado pelo Sistema Oficial de Gestão
          </div>
          <div style="text-align: right; border: 1px solid #0A111E; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #0A111E;">
            STATUS: ${player.status.toUpperCase()}
          </div>
        </div>

      </div>
    `;
  };

  // 2. Generate HTML for Attached Documents Sheet (RG/CPF & Proof of Address)
  const getDocumentsHtml = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111; padding: 20px;">
        
        <!-- Document Header -->
        <div style="text-align: center; border-bottom: 2px solid #0A111E; padding-bottom: 10px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px; color: #0A111E; text-transform: uppercase; font-weight: 900;">
            ⚡ TROVOES - DOCUMENTOS ANEXADOS DO ATLETA
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #333;">
            Atleta: ${player.fullName} | RG/CPF: ${player.rgCpf} | Categoria: ${player.category}
          </p>
        </div>

        <!-- Document 1: Identification (RG/CPF) -->
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #0A111E; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
            📄 Documento de Identificação Oficial (RG / CPF)
          </h3>
          ${player.docPhotoUrl ? `
            <div style="text-align: center; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
              <img src="${player.docPhotoUrl}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; border: 1px solid #94a3b8;" />
            </div>
          ` : `
            <div style="padding: 20px; text-align: center; border: 1px dashed #ef4444; color: #dc2626; border-radius: 8px; font-weight: bold;">
              ⚠️ Nenhum documento de identificação (RG/CPF) anexado no cadastro digital.
            </div>
          `}
        </div>

        <!-- Document 2: Proof of Address -->
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #0A111E; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
            🏠 Comprovante de Residência
          </h3>
          ${player.proofAddressUrl ? `
            <div style="text-align: center; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
              <img src="${player.proofAddressUrl}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; border: 1px solid #94a3b8;" />
            </div>
          ` : `
            <div style="padding: 20px; text-align: center; border: 1px dashed #ef4444; color: #dc2626; border-radius: 8px; font-weight: bold;">
              ⚠️ Nenhum comprovante de residência anexado no cadastro digital.
            </div>
          `}
        </div>

      </div>
    `;
  };

  // Actions
  const handlePrintFullSheet = () => {
    printReport(`Ficha_Oficial_${player.fullName.replace(/\s+/g, '_')}`, getFullFormHtml());
  };

  const handlePrintDocuments = () => {
    printReport(`Documentos_Atleta_${player.fullName.replace(/\s+/g, '_')}`, getDocumentsHtml());
  };

  const handlePrintCompletePackage = () => {
    const combinedHtml = `
      ${getFullFormHtml()}
      <div style="page-break-before: always; margin-top: 40px;"></div>
      ${getDocumentsHtml()}
    `;
    printReport(`Pacote_Inscricao_Completo_${player.fullName.replace(/\s+/g, '_')}`, combinedHtml);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0A111E] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col text-xs text-slate-200">
        
        {/* Header Modal */}
        <div className="sticky top-0 z-20 bg-[#0E1726] border-b border-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FFCC00] fill-[#FFCC00]" />
            <div>
              <h2 className="text-base font-black font-syne text-white uppercase tracking-wider">
                Passaporte & Ficha do Atleta
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Gestão Oficial TROVOES BASE</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintFullSheet}
              className="px-3 py-2 rounded-xl bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black text-xs transition flex items-center gap-1.5 shadow"
              title="Imprimir Ficha Completa + Termo do Responsável"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Imprimir Ficha + Termo</span>
            </button>
            <button
              onClick={handlePrintCompletePackage}
              className="px-3 py-2 rounded-xl bg-[#FF6600] hover:bg-[#ff7b1a] text-white font-black text-xs transition flex items-center gap-1.5 shadow"
              title="Imprimir Ficha, Termo e Todos os Documentos Anexados"
            >
              <FileCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Pacote Completo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Athlete Passport Identity Card */}
          <div className="trovoes-card p-5 rounded-3xl border border-[#FFCC00]/40 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left bg-gradient-to-r from-[#08131F] to-[#0D1B2A]">
            <img
              src={player.photoUrl}
              alt={player.fullName}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-[#FFCC00] shadow-xl shrink-0"
            />

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-[#FFCC00] text-[#0A2540] text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Categoria {player.category}
                </span>
                <span
                  className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                    player.status === 'Aprovado'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-950 text-[#FFCC00] border-[#FFCC00]/40'
                  }`}
                >
                  Status: {player.status}
                </span>
              </div>

              <h2 className="text-2xl font-black font-syne text-white">{player.fullName}</h2>
              <p className="text-[#FFCC00] font-extrabold text-xs uppercase tracking-wider">{player.position} • Pé {player.dominantFoot}</p>
              
              <p className="text-slate-300 text-xs font-medium">
                Nascimento: <strong>{formatDateBR(player.birthDate)}</strong> ({age} anos) | RG/CPF: <strong>{player.rgCpf}</strong>
              </p>
            </div>
          </div>

          {/* Biometrics & Physical Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-[#08131F] rounded-2xl border border-[#1B2A41]">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Altura</span>
              <span className="font-black text-white text-base">{player.height} cm</span>
            </div>
            <div className="p-3.5 bg-[#08131F] rounded-2xl border border-[#1B2A41]">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Peso</span>
              <span className="font-black text-white text-base">{player.weight} kg</span>
            </div>
            <div className="p-3.5 bg-[#08131F] rounded-2xl border border-[#1B2A41]">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Pé Dominante</span>
              <span className="font-black text-[#FFCC00] text-sm">{player.dominantFoot}</span>
            </div>
            <div className="p-3.5 bg-[#08131F] rounded-2xl border border-[#1B2A41]">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Clube Anterior</span>
              <span className="font-black text-white text-xs truncate block">{player.previousClub || 'Nenhum'}</span>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="p-4 bg-[#08131F] rounded-2xl border border-[#1B2A41] space-y-2">
            <span className="font-black text-[#FFCC00] text-xs uppercase tracking-wider block">Contato & Endereço</span>
            <p className="text-slate-300 font-medium"><b>Endereço Completo:</b> {player.address || 'Não informado'}</p>
            <p className="text-slate-300 font-medium"><b>Telefone Atleta:</b> {player.phone || 'Não informado'}</p>
            <p className="text-slate-300 font-medium"><b>Histórico Lesões / Cuidados:</b> {player.injuryHistory || 'Nenhum histórico grave informado'}</p>
          </div>

          {/* Guardians List */}
          <div className="p-4 bg-[#08131F] rounded-2xl border border-[#1B2A41] space-y-3">
            <span className="font-black text-[#FFCC00] text-xs uppercase tracking-wider block">Responsável Legal</span>
            {player.guardians?.map((g, idx) => (
              <div key={idx} className="p-3 bg-[#0A111E] rounded-xl border border-[#1B2A41] space-y-1">
                <p className="font-bold text-white text-sm">{g.name} <span className="text-xs text-[#FFCC00] font-normal">({g.relationship})</span></p>
                <p className="text-slate-300 text-xs font-medium">CPF: {g.cpf} | WhatsApp: {g.phone} | Email: {g.email || 'N/A'}</p>
              </div>
            ))}
          </div>

          {/* Minor Authorization Legal Term */}
          <div className="p-5 bg-[#FF6600]/10 rounded-2xl border border-[#FF6600]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-[#FF6600] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> Termo Legal do Responsável
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Assinado em {player.minorAuthorization?.date}</span>
            </div>

            <p className="text-slate-200 text-xs italic leading-relaxed bg-[#08131F]/80 p-3 rounded-xl border border-[#1B2A41]">
              "{player.minorAuthorization?.legalText}"
            </p>

            {player.minorAuthorization?.signatureDataUrl && (
              <div className="pt-2 border-t border-[#FF6600]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#FFCC00] font-black uppercase tracking-wider block mb-1">
                    Assinatura Digital do Responsável:
                  </span>
                  <img
                    src={player.minorAuthorization.signatureDataUrl}
                    alt="Assinatura"
                    className="max-h-20 bg-white p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold">CPF Declarante:</p>
                  <p className="text-xs font-mono text-white font-bold">{player.minorAuthorization?.guardianCpf || player.guardians?.[0]?.cpf}</p>
                </div>
              </div>
            )}
          </div>

          {/* NEW: Attached Documents Section (RG/CPF and Proof of Address) */}
          <div className="p-5 bg-[#08131F] rounded-2xl border border-[#1B2A41] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2A41] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FFCC00]" />
                <h3 className="font-black text-white text-xs uppercase tracking-wider">
                  Documentos Anexados na Inscrição
                </h3>
              </div>
              <button
                onClick={handlePrintDocuments}
                className="text-xs text-[#FFCC00] hover:underline font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Documentos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doc 1: RG / CPF */}
              <div className="p-3.5 rounded-xl bg-[#0A111E] border border-[#1B2A41] space-y-2">
                <span className="font-bold text-slate-300 text-xs block">
                  1. Documento Oficial (RG / CPF)
                </span>
                {player.docPhotoUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={player.docPhotoUrl} 
                      alt="RG/CPF" 
                      className="w-full h-36 object-cover rounded-xl border border-[#1B2A41] cursor-pointer hover:opacity-90 transition"
                      onClick={() => setSelectedDocPreview({ title: 'Documento Oficial (RG/CPF)', url: player.docPhotoUrl! })}
                    />
                    <button
                      onClick={() => setSelectedDocPreview({ title: 'Documento Oficial (RG/CPF)', url: player.docPhotoUrl! })}
                      className="w-full py-1.5 bg-[#08131F] hover:bg-[#122336] text-[#FFCC00] border border-[#FFCC00]/30 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizar Documento
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">
                    Documento RG/CPF pendente de envio.
                  </div>
                )}
              </div>

              {/* Doc 2: Proof of Address */}
              <div className="p-3.5 rounded-xl bg-[#0A111E] border border-[#1B2A41] space-y-2">
                <span className="font-bold text-slate-300 text-xs block">
                  2. Comprovante de Residência
                </span>
                {player.proofAddressUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={player.proofAddressUrl} 
                      alt="Comprovante de Residência" 
                      className="w-full h-36 object-cover rounded-xl border border-[#1B2A41] cursor-pointer hover:opacity-90 transition"
                      onClick={() => setSelectedDocPreview({ title: 'Comprovante de Residência', url: player.proofAddressUrl! })}
                    />
                    <button
                      onClick={() => setSelectedDocPreview({ title: 'Comprovante de Residência', url: player.proofAddressUrl! })}
                      className="w-full py-1.5 bg-[#08131F] hover:bg-[#122336] text-[#FFCC00] border border-[#FFCC00]/30 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizar Comprovante
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">
                    Comprovante de residência pendente de envio.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 bg-[#0E1726] border-t border-[#1B2A41] p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintFullSheet}
              className="px-4 py-2.5 rounded-xl bg-[#08131F] hover:bg-[#122336] text-[#FFCC00] border border-[#FFCC00]/40 font-black text-xs transition flex items-center gap-2 uppercase tracking-wider"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir Ficha + Termo</span>
            </button>
            <button
              onClick={handlePrintDocuments}
              className="px-4 py-2.5 rounded-xl bg-[#08131F] hover:bg-[#122336] text-slate-200 border border-[#1B2A41] font-bold text-xs transition flex items-center gap-2 uppercase tracking-wider"
            >
              <FileText className="w-4 h-4 text-[#FFCC00]" />
              <span>Imprimir Documentos</span>
            </button>
          </div>

          {isAdmin && player.status === 'Pendente' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateStatus('Recusado')}
                className="px-4 py-2.5 rounded-xl bg-red-950 text-red-300 font-bold hover:bg-red-900 text-xs transition uppercase"
              >
                Recusar
              </button>
              <button
                onClick={() => handleUpdateStatus('Aprovado')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A2540] font-black text-xs shadow-lg transition flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprovar Atleta</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Document Full Size Modal View */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-[#0A111E] border border-slate-700 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-sm uppercase">{selectedDocPreview.title}</h3>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black rounded-2xl flex justify-center">
              <img 
                src={selectedDocPreview.url} 
                alt="Documento Preview" 
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.open(selectedDocPreview.url, '_blank')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Abrir Imagem Original
              </button>
              <button
                onClick={handlePrintDocuments}
                className="px-4 py-2 rounded-xl bg-[#FFCC00] text-[#0A2540] font-black text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

