import { aiRepository } from '../repositories/aiRepository';
import { AIAdaptiveNudge, RoleId } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const aiNudgeService = {
  async getNudges(): Promise<AIAdaptiveNudge[]> {
    return aiRepository.getNudges();
  },

  async generateNudge(params: {
    citizenId: string;
    citizenName: string;
    targetDialect: AIAdaptiveNudge['targetDialect'];
    nudgeObjective: AIAdaptiveNudge['nudgeObjective'];
    channel: AIAdaptiveNudge['channel'];
    actor: { id: string; name: string; role: string };
  }): Promise<AIAdaptiveNudge> {
    let message = '';
    let tone = '';

    if (params.targetDialect === 'MELAYU_TALIABU') {
      if (params.nudgeObjective === 'PENGINGAT_MINUM_OBAT') {
        message = `Tabea Bapa/Mama ${params.citizenName}, inga malam ini minum obat tensi e. Walau su rasa badan enakan, obat musti jalan trus biar sehat lancar ba-kebun deng ba-nelayan. Salam dari Kader Posyandu.`;
        tone = 'Hangat, Kultural Pesisir, Menghormati';
      } else if (params.nudgeObjective === 'JADWAL_KONTROL_PUSKESMAS') {
        message = `Selamat siang Bapa/Mama ${params.citizenName}, besok ada jadwal periksa di Puskesmas. Jangan lupa bawa kartu BPJS/KTP e, nanti katong Kader bantu temani di faskes.`;
        tone = 'Penuh Kepedulian, Mendorong Kehadiran';
      } else {
        message = `Tabea Bapa/Mama ${params.citizenName}, mari katong sama-sama jaga kesehatan. Kurangi garam deng makanan manis e biar tensi tetap aman.`;
        tone = 'Edukasi Santun Kultural';
      }
    } else if (params.targetDialect === 'BAHASA_SEDERHANA_LANSIA') {
      if (params.nudgeObjective === 'PENGINGAT_MINUM_OBAT') {
        message = `Selamat malam Opa/Oma ${params.citizenName}. Jangan lupa minum 1 butir obat malam ini sesudah makan ya. Agar tidur nyenyak dan besok pagi badan tetap segar.`;
        tone = 'Lembut, Kalimat Singkat, Mudah Dipahami';
      } else {
        message = `Selamat pagi Opa/Oma ${params.citizenName}. Besok ada pemeriksaan kesehatan rutin di Posyandu dekat rumah. Nanti kami jemput ya.`;
        tone = 'Menenangkan, Menawarkan Bantuan';
      }
    } else {
      // BAHASA_INDONESIA_SANTUN
      if (params.nudgeObjective === 'PENGINGAT_MINUM_OBAT') {
        message = `Yth. Bapak/Ibu ${params.citizenName}, ini adalah pengingat ramah untuk meminum obat rutin Anda hari ini. Kepatuhan minum obat melindungi jantung dan ginjal Anda.`;
        tone = 'Profesional, Informatif, Santun';
      } else {
        message = `Yth. Bapak/Ibu ${params.citizenName}, jadwal kontrol kesehatan berkala Anda di faskes adalah besok. Layanan CKG dan konsultasi dokter siap membantu Anda.`;
        tone = 'Resmi, Mendukung';
      }
    }

    const created = await aiRepository.createNudge({
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      targetDialect: params.targetDialect,
      nudgeObjective: params.nudgeObjective,
      generatedMessage: message,
      empathyTone: tone,
      channel: params.channel,
      readinessScore: 88,
      status: 'DRAFT',
    });

    await auditRepo.log({
      actorUserId: params.actor.id,
      actorName: params.actor.name,
      actorRole: (params.actor.role || 'KADER') as RoleId,
      action: 'CREATE',
      entityType: 'POPULATION_INTERVENTION',
      entityId: created.id,
      targetLabel: `AI Adaptive Nudge: ${params.citizenName}`,
      description: `Pesan edukasi AI dialek ${params.targetDialect} digenerate untuk ${params.nudgeObjective}`,
      details: {
        channel: params.channel,
        messageSnippet: message.slice(0, 70),
      },
    });

    return created;
  },
};
