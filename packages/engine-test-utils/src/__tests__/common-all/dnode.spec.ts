import {
  NoteUtils,
  SchemaUtils,
  DVault,
  SchemaOpts,
} from "@dendronhq/common-all";
import { NoteTestUtilsV4 } from "@dendronhq/common-test-utils";

describe(`NoteUtils tests:`, () => {
  describe(`genSchemaDesc tests`, () => {
    const vault = { fsPath: "/tmp/ws/vault1" };
    const SCHEMA_ID = "id-1";

    async function test_genSchemaDesc(
      schemaCreateOpts: SchemaOpts & { vault: DVault },
      expectedDescription: string
    ) {
      const schema = SchemaUtils.createFromSchemaOpts(schemaCreateOpts);

      const wsRoot = "/tmp/ws/";
      const schemaModuleProps = await NoteTestUtilsV4.createSchema({
        fname: "/tmp/fname1",
        vault: vault,
        wsRoot,
        noWrite: true,
      });
      schemaModuleProps.schemas[SCHEMA_ID] = schema;

      const note = await NoteTestUtilsV4.createNote({
        vault,
        wsRoot,
        noWrite: true,
        fname: "f1",
        props: {
          schema: {
            schemaId: schema.id,
            moduleId: "irrelevant",
          },
        },
      });

      const desc = NoteUtils.genSchemaDesc(note, schemaModuleProps);
      expect(desc).toEqual(expectedDescription);
    }

    it(`WHEN id is auto generated THEN use the pattern.`, async () => {
      await test_genSchemaDesc(
        {
          fname: "hi",
          id: SCHEMA_ID,
          data: { pattern: "pattern-val", isIdAutoGenerated: true },
          vault,
        },
        "F1 $(repo) /tmp/fname1 $(breadcrumb-separator) pattern-val"
      );
    });

    it(`WHEN id is auto generated AND title is different than id then use title`, async () => {
      await test_genSchemaDesc(
        {
          fname: "hi",
          title: "title-val",
          id: SCHEMA_ID,
          data: { pattern: "pattern-val", isIdAutoGenerated: true },
          vault,
        },
        "F1 $(repo) /tmp/fname1 $(breadcrumb-separator) title-val"
      );
    });

    it(`WHEN id is not auto generated AND title is equal to id THEN use title.`, async () => {
      await test_genSchemaDesc(
        {
          fname: "hi",
          title: SCHEMA_ID,
          id: SCHEMA_ID,
          data: { pattern: "pattern-val" },
          vault,
        },
        `F1 $(repo) /tmp/fname1 $(breadcrumb-separator) ${SCHEMA_ID}`
      );
    });

    it(`WHEN id is not auto generated AND title is omitted THEN use id.`, async () => {
      await test_genSchemaDesc(
        {
          fname: "hi",
          title: undefined,
          id: SCHEMA_ID,
          data: { pattern: "pattern-val" },
          vault,
        },
        `F1 $(repo) /tmp/fname1 $(breadcrumb-separator) ${SCHEMA_ID}`
      );
    });
  });
});