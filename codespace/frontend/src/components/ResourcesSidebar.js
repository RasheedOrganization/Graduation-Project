import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function ResourcesSidebar({
  showForm,
  setShowForm,
  showTopicForm,
  setShowTopicForm,
  showSubtopicForm,
  setShowSubtopicForm,
  formData,
  handleFormChange,
  addResource,
  topics,
  newTopic,
  setNewTopic,
  addTopic,
  newSubtopic,
  setNewSubtopic,
  addSubtopic,
  selectedStage,
  handleStageChange,
  selectedTopic,
  handleTopicChange,
  selectedSubtopic,
  setSelectedSubtopic,
  isAdmin,
}) {
  return (
    <div className="left-menu">
      {isAdmin && (
        <>
          <div className="button-group">
            <button onClick={() => setShowForm(!showForm)}>New Resource</button>
            <button onClick={() => setShowTopicForm(!showTopicForm)}>New Topic</button>
            <button onClick={() => setShowSubtopicForm(!showSubtopicForm)}>New Subtopic</button>
          </div>
          {showForm && (
            <form className="add-resource-form" onSubmit={addResource}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
              <input
                type="text"
                name="link"
                placeholder="Link"
                value={formData.link}
                onChange={handleFormChange}
                required
              />
              <FormControl fullWidth size="small">
                <InputLabel id="resource-stage-label">Stage</InputLabel>
                <Select
                  labelId="resource-stage-label"
                  name="stage"
                  value={formData.stage}
                  label="Stage"
                  onChange={handleFormChange}
                  required
                >
                  {['Bronze', 'Silver', 'Gold'].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!formData.stage}>
                <InputLabel id="resource-topic-label">Topic</InputLabel>
                <Select
                  labelId="resource-topic-label"
                  name="topic"
                  value={formData.topic}
                  label="Topic"
                  onChange={handleFormChange}
                  required
                >
                  {formData.stage &&
                    Object.keys(topics[formData.stage] || {}).map((topic) => (
                      <MenuItem key={topic} value={topic}>
                        {topic}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!formData.topic}>
                <InputLabel id="resource-subtopic-label">Subtopic</InputLabel>
                <Select
                  labelId="resource-subtopic-label"
                  name="subtopic"
                  value={formData.subtopic}
                  label="Subtopic"
                  onChange={handleFormChange}
                  required
                >
                  {formData.stage &&
                    formData.topic &&
                    topics[formData.stage][formData.topic].map((sub) => (
                      <MenuItem key={sub} value={sub}>
                        {sub}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <button type="submit">Add</button>
            </form>
          )}
          {showTopicForm && (
            <form className="add-topic-form" onSubmit={addTopic}>
              <FormControl fullWidth size="small">
                <InputLabel id="topic-stage-label">Stage</InputLabel>
                <Select
                  labelId="topic-stage-label"
                  value={newTopic.stage}
                  label="Stage"
                  onChange={(e) => setNewTopic((prev) => ({ ...prev, stage: e.target.value }))}
                  required
                >
                  {['Bronze', 'Silver', 'Gold'].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <input
                type="text"
                value={newTopic.name}
                onChange={(e) => setNewTopic((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Topic Name"
                required
              />
              <button type="submit">Add</button>
            </form>
          )}
          {showSubtopicForm && (
            <form className="add-subtopic-form" onSubmit={addSubtopic}>
              <FormControl fullWidth size="small">
                <InputLabel id="subtopic-stage-label">Stage</InputLabel>
                <Select
                  labelId="subtopic-stage-label"
                  value={newSubtopic.stage}
                  label="Stage"
                  onChange={(e) =>
                    setNewSubtopic((prev) => ({ ...prev, stage: e.target.value, topic: '' }))
                  }
                  required
                >
                  {['Bronze', 'Silver', 'Gold'].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!newSubtopic.stage}>
                <InputLabel id="subtopic-topic-label">Topic</InputLabel>
                <Select
                  labelId="subtopic-topic-label"
                  value={newSubtopic.topic}
                  label="Topic"
                  onChange={(e) =>
                    setNewSubtopic((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  required
                >
                  {newSubtopic.stage &&
                    Object.keys(topics[newSubtopic.stage] || {}).map((topic) => (
                      <MenuItem key={topic} value={topic}>
                        {topic}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <input
                type="text"
                value={newSubtopic.name}
                onChange={(e) => setNewSubtopic((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Subtopic Name"
                required
              />
              <button type="submit">Add</button>
            </form>
          )}
        </>
      )}
      <FormControl fullWidth size="small">
        <InputLabel id="filter-stage-label">Stage</InputLabel>
        <Select
          labelId="filter-stage-label"
          value={selectedStage}
          label="Stage"
          onChange={handleStageChange}
        >
          <MenuItem value="">All Stages</MenuItem>
          {['Bronze', 'Silver', 'Gold'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small" disabled={!selectedStage}>
        <InputLabel id="filter-topic-label">Topic</InputLabel>
        <Select
          labelId="filter-topic-label"
          value={selectedTopic}
          label="Topic"
          onChange={handleTopicChange}
          disabled={!selectedStage}
        >
          <MenuItem value="">All Topics</MenuItem>
          {selectedStage &&
            Object.keys(topics[selectedStage] || {}).map((topic) => (
              <MenuItem key={topic} value={topic}>
                {topic}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small" disabled={!selectedTopic}>
        <InputLabel id="filter-subtopic-label">Subtopic</InputLabel>
        <Select
          labelId="filter-subtopic-label"
          value={selectedSubtopic}
          label="Subtopic"
          onChange={(e) => setSelectedSubtopic(e.target.value)}
          disabled={!selectedTopic}
        >
          <MenuItem value="">All Subtopics</MenuItem>
          {selectedStage &&
            selectedTopic &&
            topics[selectedStage][selectedTopic].map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default ResourcesSidebar;

