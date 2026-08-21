import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      profileKey: a.string().required(),
      displayName: a.string(),
      weightUnit: a.string(),
      defaultRestSeconds: a.integer(),
      beginnerMode: a.boolean(),
      theme: a.string(),
      autoRestTimer: a.boolean(),
      preferencesJson: a.string(),
      routineOverridesJson: a.string(),
      createdAtClient: a.datetime(),
      updatedAtClient: a.datetime(),
    })
    .secondaryIndexes((index) => [index('profileKey')])
    .authorization((allow) => [allow.owner()]),

  WorkoutSession: a
    .model({
      date: a.string().required(),
      workoutType: a.string().required(),
      status: a.string().required(),
      startedAt: a.datetime(),
      completedAt: a.datetime(),
      durationSeconds: a.integer(),
      totalVolume: a.float(),
      notes: a.string(),
      sorenessScore: a.integer(),
      sorenessAreasJson: a.string(),
      planSnapshotJson: a.string(),
      selectedCardio: a.string(),
      substitutionsJson: a.string(),
    })
    .secondaryIndexes((index) => [index('date')])
    .authorization((allow) => [allow.owner()]),

  SetLog: a
    .model({
      sessionId: a.id().required(),
      exerciseId: a.string().required(),
      exerciseName: a.string(),
      phase: a.string(),
      setNumber: a.integer().required(),
      side: a.string(),
      setType: a.string().required(),
      weight: a.float(),
      weightUnit: a.string(),
      reps: a.integer(),
      durationSeconds: a.integer(),
      completed: a.boolean(),
      notes: a.string(),
      loggedAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('sessionId').sortKeys(['exerciseId']),
      index('exerciseId'),
    ])
    .authorization((allow) => [allow.owner()]),

  ExerciseSetting: a
    .model({
      exerciseId: a.string().required(),
      seat: a.string(),
      backrest: a.string(),
      handle: a.string(),
      machine: a.string(),
      pin: a.string(),
      machineSettingsJson: a.string(),
      preferredWeight: a.float(),
      preferredUnit: a.string(),
      notes: a.string(),
      updatedAtClient: a.datetime(),
    })
    .secondaryIndexes((index) => [index('exerciseId')])
    .authorization((allow) => [allow.owner()]),

  PersonalRecord: a
    .model({
      exerciseId: a.string().required(),
      exerciseName: a.string(),
      side: a.string(),
      recordType: a.string().required(),
      weight: a.float(),
      reps: a.integer(),
      volume: a.float(),
      estimatedOneRepMax: a.float(),
      achievedAt: a.datetime().required(),
      sessionId: a.id(),
    })
    .secondaryIndexes((index) => [
      index('exerciseId').sortKeys(['achievedAt']),
    ])
    .authorization((allow) => [allow.owner()]),

  RecoveryLog: a
    .model({
      date: a.string().required(),
      activityType: a.string().required(),
      durationMinutes: a.integer(),
      sorenessScore: a.integer(),
      sorenessAreasJson: a.string(),
      completed: a.boolean(),
      notes: a.string(),
    })
    .secondaryIndexes((index) => [index('date')])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
