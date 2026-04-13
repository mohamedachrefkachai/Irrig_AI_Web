import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import FarmActuatorState from "../../../../../../models/FarmActuatorState";
import mongoose from "mongoose";
import mqtt from "mqtt";

async function publishValveCommand(farmId: string, valveState: "ON" | "OFF") {
	const brokerUrl = process.env.MQTT_URL || "mqtts://xxxxxxxxxxxx.s1.eu.hivemq.cloud:8883";
	const mqttUsername = process.env.MQTT_USERNAME;
	const mqttPassword = process.env.MQTT_PASSWORD;
	const topic = `farm/${farmId}/actuator/cmd`;

	await new Promise<void>((resolve, reject) => {
		const client = mqtt.connect(brokerUrl, {
			username: mqttUsername,
			password: mqttPassword,
		});

		client.on("connect", () => {
			client.publish(topic, JSON.stringify({ valve_state: valveState }), {}, (error) => {
				client.end();
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});

		client.on("error", (error) => {
			client.end();
			reject(error);
		});
	});
}

export async function GET(
	req: NextRequest,
	context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }
) {
	await connectDB();

	const resolved = typeof (context.params as any).then === "function"
		? await (context.params as Promise<{ farmId: string }>)
		: (context as any).params;

	const actuator = await FarmActuatorState.findOne({
		farm_id: new mongoose.Types.ObjectId(resolved.farmId),
	});

	if (!actuator) {
		return NextResponse.json({
			farm_id: resolved.farmId,
			valve_state: "OFF",
			mode: "MANUAL",
			updated_at: null,
		});
	}

	return NextResponse.json({
		farm_id: String(actuator.farm_id),
		zone_id: actuator.zone_id ? String(actuator.zone_id) : null,
		valve_state: actuator.valve_state,
		mode: actuator.mode,
		updated_at: actuator.updated_at,
	});
}

export async function POST(
	req: NextRequest,
	context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }
) {
	await connectDB();

	const resolved = typeof (context.params as any).then === "function"
		? await (context.params as Promise<{ farmId: string }>)
		: (context as any).params;

	const body = await req.json();
	const valveState = body.valve_state === "ON" ? "ON" : "OFF";
	const mode = body.mode === "AUTO" ? "AUTO" : "MANUAL";

	const actuator = await FarmActuatorState.findOneAndUpdate(
		{ farm_id: new mongoose.Types.ObjectId(resolved.farmId) },
		{
			farm_id: new mongoose.Types.ObjectId(resolved.farmId),
			zone_id: body.zone_id ? new mongoose.Types.ObjectId(body.zone_id) : undefined,
			valve_state: valveState,
			mode,
			updated_at: new Date(),
		},
		{ upsert: true, new: true }
	);

	try {
		await publishValveCommand(resolved.farmId, valveState as "ON" | "OFF");
	} catch (error) {
		console.error("MQTT publish failed:", error);
	}

	return NextResponse.json({
		farm_id: String(actuator.farm_id),
		zone_id: actuator.zone_id ? String(actuator.zone_id) : null,
		valve_state: actuator.valve_state,
		mode: actuator.mode,
		updated_at: actuator.updated_at,
	});
}
