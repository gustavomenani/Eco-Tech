import { describe, expect, it, vi } from "vitest";
import { getEcopointsGeoDocument } from "@/lib/data";
import { buildEcopointsDocument, formatIsoLocalDate, syncEcopoints } from "@/scripts/update-ecopoints";

const sampleHtml = `
<section>
  <h2>ECOPONTOS</h2>
  <p>ECOPONTOS</p>
  <p>Ecoponto Lago Azul</p>
  <p>Cruzamento entre Av. Juscelino Kubitschek e Rua José Guerra.</p>
  <p>Ecoponto Claudionor Cinti</p>
  <p>Cruzamento entre Av. Juscelino Kubitschek e Rua Adalberto da Cunha Capela.</p>
  <p>O que levar a um ecoponto</p>
  <p>Entulho, madeira, plástico, metal, vidro, papel e papelão, móveis, eletrodomésticos, lâmpadas, baterias domésticas e restos de capina, jardinagem e poda de árvores.</p>
  <p>Horário de atendimento</p>
  <p>Todos os dias, 24h.</p>
  <p>COLETA SELETIVA</p>
  <p>PONTOS DE ENTREGA VOLUNTÁRIA (PEV)</p>
  <p>PONTOS DE ENTREGA VOLUNTÁRIA (PEV)</p>
  <p>Av. Doutor Alcides Fagundes Chagas, 222 – Bairro Aviação.</p>
  <p>O que levar a um PEV: madeira, plástico, metal, vidro, papel e papelão, lâmpadas e baterias domésticas.</p>
  <p>CENTRO DE TRATAMENTO DE RESÍDUOS (CTR)</p>
</section>
`;

describe("update ecopoints script", () => {
  it("builds a document from the source HTML and geo aliases", () => {
    const document = buildEcopointsDocument(sampleHtml, getEcopointsGeoDocument(), new Date("2026-03-31T12:00:00Z"));

    expect(document.points).toHaveLength(3);
    expect(document.points.at(-1)?.type).toBe("pev");
    expect(document.points.at(-1)?.address).toContain("Av. Doutor Alcides Fagundes Chagas, 222");
    expect(document.consultedAt).toBe("2026-03-31");
  });

  it("throws when an ecoponto entry loses its address line", () => {
    const malformedHtml = sampleHtml.replace(
      "<p>Cruzamento entre Av. Juscelino Kubitschek e Rua Adalberto da Cunha Capela.</p>",
      ""
    );

    expect(() => buildEcopointsDocument(malformedHtml, getEcopointsGeoDocument())).toThrow(
      /endereç|endereço|identificar o endereço/i
    );
  });

  it("formats local ISO dates without UTC drift", () => {
    expect(formatIsoLocalDate(new Date(2026, 2, 31, 23, 30, 0))).toBe("2026-03-31");
  });

  it("does not write a file when the fetch step fails", async () => {
    const saveDocument = vi.fn();

    await expect(
      syncEcopoints({
        loadHtml: async () => {
          throw new Error("network down");
        },
        loadGeo: async () => getEcopointsGeoDocument(),
        saveDocument
      })
    ).rejects.toThrow("network down");

    expect(saveDocument).not.toHaveBeenCalled();
  });
});
