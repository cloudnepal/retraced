import "source-map-support/register";
import getPgPool from "../persistence/pg";
import nsq from "../persistence/nsq";

const pgPool = getPgPool();

export default async function ingestFromBacklog() {
    const q = `
        WITH deleted AS (
            DELETE FROM backlog
            RETURNING
                new_event_id,
                project_id,
                environment_id,
                received,
                original_event
        )
        INSERT INTO ingest_task (
            id,
            new_event_id,
            project_id,
            environment_id,
            received,
            original_event
        ) SELECT md5(random()::text), * FROM deleted
        ON CONFLICT DO NOTHING
        RETURNING id`;

    const result = await pgPool.query(q, []);

    for (const row of result.rows) {
        const job = JSON.stringify({
            taskId: row.id,
        });
        await nsq.produce("raw_events", job);
    }
}
