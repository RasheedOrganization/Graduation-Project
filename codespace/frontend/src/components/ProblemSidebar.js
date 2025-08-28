import React from 'react';

function ProblemSidebar({
  showForm,
  setShowForm,
  showTopicForm,
  setShowTopicForm,
  showSubtopicForm,
  setShowSubtopicForm,
  formData,
  handleFormChange,
  addProblem,
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
}) {
  return (
    <div className="left-menu">
      <div className="button-group">
        <button onClick={() => setShowForm(!showForm)}>New Problem</button>
        <button onClick={() => setShowTopicForm(!showTopicForm)}>New Topic</button>
        <button onClick={() => setShowSubtopicForm(!showSubtopicForm)}>New Subtopic</button>
      </div>
      {showForm && (
        <form className="add-resource-form" onSubmit={addProblem}>
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
          <select
            name="stage"
            value={formData.stage}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Stage</option>
            {['Bronze', 'Silver', 'Gold'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleFormChange}
            disabled={!formData.stage}
            required
          >
            <option value="">Select Topic</option>
            {formData.stage &&
              Object.keys(topics[formData.stage] || {}).map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
          </select>
          <select
            name="subtopic"
            value={formData.subtopic}
            onChange={handleFormChange}
            disabled={!formData.topic}
            required
          >
            <option value="">Select Subtopic</option>
            {formData.stage &&
              formData.topic &&
              topics[formData.stage][formData.topic].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Insane">Insane</option>
          </select>
          <button type="submit">Add</button>
        </form>
      )}
      {showTopicForm && (
        <form className="add-topic-form" onSubmit={addTopic}>
          <select
            value={newTopic.stage}
            onChange={(e) => setNewTopic((prev) => ({ ...prev, stage: e.target.value }))}
            required
          >
            <option value="">Select Stage</option>
            {['Bronze', 'Silver', 'Gold'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
          <select
            value={newSubtopic.stage}
            onChange={(e) => setNewSubtopic((prev) => ({ ...prev, stage: e.target.value, topic: '' }))}
            required
          >
            <option value="">Select Stage</option>
            {['Bronze', 'Silver', 'Gold'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={newSubtopic.topic}
            onChange={(e) => setNewSubtopic((prev) => ({ ...prev, topic: e.target.value }))}
            disabled={!newSubtopic.stage}
            required
          >
            <option value="">Select Topic</option>
            {newSubtopic.stage &&
              Object.keys(topics[newSubtopic.stage] || {}).map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
          </select>
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
      <select value={selectedStage} onChange={handleStageChange}>
        <option value="">All Stages</option>
        {['Bronze', 'Silver', 'Gold'].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select value={selectedTopic} onChange={handleTopicChange} disabled={!selectedStage}>
        <option value="">All Topics</option>
        {selectedStage &&
          Object.keys(topics[selectedStage] || {}).map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
      </select>
      <select
        value={selectedSubtopic}
        onChange={(e) => setSelectedSubtopic(e.target.value)}
        disabled={!selectedTopic}
      >
        <option value="">All Subtopics</option>
        {selectedStage &&
          selectedTopic &&
          topics[selectedStage][selectedTopic].map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
      </select>
    </div>
  );
}

export default ProblemSidebar;
