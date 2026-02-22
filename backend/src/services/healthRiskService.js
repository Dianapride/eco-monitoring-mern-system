import crypto from 'crypto';
import { z } from 'zod';
import references from '../config/references.json' with { type: 'json' };

const inputSchema = z.object({
  pollutant: z.string().min(1),
  medium: z.enum(['повітря', 'вода']),
  C: z.number().min(0, "Концентрація не може бути від'ємною"),
  IR: z.number().positive("IR повинен бути > 0"),
  EF: z.number().int().min(1).max(365),
  ED: z.number().int().min(1).max(80),
  BW: z.number().positive("BW повинен бути > 0"),
  AT: z.number().positive()
});

export const computeHealthRisk = (payload) => {
  const input = inputSchema.parse(payload);

  const CDI = (input.C * input.IR * input.EF * input.ED) / (input.BW * input.AT);

  const ref = references.find(r => 
    r.pollutant.toLowerCase() === input.pollutant.toLowerCase() && 
    r.medium === input.medium
  );

  const HQ = ref?.RfD ? CDI / ref.RfD : null;
  const CR = ref?.SF ? CDI * ref.SF : null;

  const hash = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');

  return {
    CDI: Number(CDI.toFixed(10)),
    HQ: HQ ? Number(HQ.toFixed(3)) : null,
    CR: CR ? Number(CR.toExponential(3)) : null,
    HI: HQ,
    hash,
    units: {
      C: input.medium === 'вода' ? 'мг/л' : 'мг/м³',
      IR: input.medium === 'вода' ? 'л/добу' : 'м³/добу'
    },
    referenceUsed: ref || null
  };
};