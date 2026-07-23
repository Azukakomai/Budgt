::: abstracteng
Traditional manual hydrocarbon prediction using Gas While Drilling data
has long been hindered by inefficiencies and inaccuracies, largely due
to human error and the complexity of multi-parameter data analysis.
Petrophysical interpretation requires the integration of many variables
such as porosity, permeability, resistivity, and saturation, which often
makes manual evaluation inconsistent. This study seeks to overcome these
limitations by developing a decision support system specifically
designed to analyze and visualize Gas While Drilling data in a more
intuitive manner. The proposed framework integrates deterministic
algorithms with industry-standard petrophysical formulas to process raw
well data. The processed data is then presented through intuitive
graphical visualizations, enabling geoscientists to identify trends and
anomalies more effectively. Furthermore, the system employs rule-based
logic to compare derived parameters against established geological
thresholds, allowing for a preliminary yet structured prediction of
hydrocarbon presence. The system will be capable of distinguishing
between hydrocarbon types (e.g., oil or gas) at varying depths, thereby
providing more insights into subsurface conditions. This approach not
only reduces the risk of human error but also enhances decision-making
in exploration and reservoir characterization.

**Keywords:** *Hydrocarbon Prediction, Data Visualization, Deterministic
Algorithms, Decision Support System.*
:::

# INTRODUCTION

# RESEARCH METHODOLOGY

## Proposed Research Design

This research aims to develop an application capable of predicting
hydrocarbon types given Gas While Drilling data. The system will first
take the given data and parse it, ensuring every row and column meets
the required standard and is eligible for further processing. The data
will then be separated into 8 columns, which will subsequently go
through ratio computations (wetness, balance, etc.) and other formulas
to produce 16 additional derived columns. Those columns will be
represented as side-by-side area charts in which the $y$-axis represents
depth and the $x$-axis represents each column's respective data. The
system will then determine---for each anomaly---whether a given *zone*
(area of depth) contains hydrocarbons and, with the processed data,
produce a prediction of the hydrocarbon type.

Numerous datasets will be provided to test the system in cases with
different hydrocarbon types to confirm whether this system produces
accurate and precise predictions. In order to measure accuracy, proven
data will also be used as a benchmark. The following sections elaborate
on how, where, and which data will be used, alongside a deeper
description of the system's components: the formulas and ratios
employed, the programming language chosen, and the proposed application
design.

## Proposed Application Design & Workflow

The proposed software application is engineered to automate the
ingestion, calculation, and visualization of mud logging gas data. To
build a robust decision platform, the system workflow is divided into
three consecutive engineering stages: data parsing, deterministic
multiple parameters logic calculation, and visual rendering.

### Data Parsing & File Ingestion

The entry point of the software pipeline handles raw mud logging text
files (.txt), Excel spreadsheets (.xlsx), or comma-separated values
(.csv) uploaded by the user. To address the issue of messy data (ex.
missing values) The application will implement a data parsing system.
This parsing layer executes several core structural operations:

1.  **Metadata and Header Isolation :** Mud logging files usually begin
    with several lines of text headers containing meta-information, such
    as the well name, company, and geographic location. The parser reads
    the file line-by-line to look for a specific keyword trigger (such
    as `‘ A` or `Depth`) to separate these text descriptions from the
    actual numbers below it.

2.  **Data Cleaning:** Once the correct column positions are locked in,
    the system loops through the remaining rows of the file. It splits
    each line of text using commas, tabs, or spaces as delimiters,
    strips out any invisible formatting characters, and converts the raw
    text strings into floating-point numbers that Python can use in
    mathematical equations.

### Petrophysical Indicators & System Decision Logic

Once the data is cleaned and standardized, it passes into the core
deterministic engine. The proposed system will utilize a network of
established petrophysical indicators to analyze the gas stream. The
collective output of these calculations forms the system decision logic,
allowing the app to automatically classify fluid types and reservoir
zones meter by meter.

#### Pixler Hydrocarbon Ratios

\
The system evaluates the light gas components using the classic ratio
methods established by @ref13. These ratios compare the relationships of
early-boiling hydrocarbons to distinguish between dry gas streaks and
oil-bearing intervals.

$$\begin{equation}
    \text{Ratio}_1 = \frac{C1}{C2}
\end{equation}$$

$$\begin{equation}
    \text{Ratio}_2 = \frac{C1}{C3}
\end{equation}$$

$$\begin{equation}
    \text{Ratio}_3 = \frac{C2}{C3}
\end{equation}$$

A very high $C_1/C_2$ ratio indicates a strict, isolated dry gas
environment. As the ratio drops, it signals an increasing concentration
of heavy, wet gas components or oil-associated reservoir fluids
[@ref13].

#### Expanded Light-to-Heavy Butane Multipliers

\
To fully utilize the specific butane fractions provided in modern log
arrays, the engine tracks methane against individual butane isomers:

$$\begin{equation}
    \text{Ratio}_4 = \frac{C1}{iC4}
\end{equation}$$

$$\begin{equation}
    \text{Ratio}_5 = \frac{C1}{nC4}
\end{equation}$$

Evaluating the isobutane ($iC_4$) and normal butane ($nC_4$) paths
separately provides a highly sensitive indicator for heavy, liquid-rich
reservoir boundaries.

#### Total Gas Volume (TG)

\
Unlike the absolute gas baseline is established by summing all recorded
hydrocarbon fractions at each depth interval as outlined in standard
drilling manuals [@ref14]:

$$\begin{equation}
    TG = C1 + C2 + C3 + iC4 + nC4 + iC5 + nC5
\end{equation}$$

This research will give the option to users to input their own TG.
Should no TG data be uploaded, this function will be ran to find the
estimated TG.

#### Dryness Ratio

\
The dryness factor isolates the exact percentage of methane within the
absolute gas volume to quickly verify gas purity:

$$\begin{equation}
    \text{Dryness} = \frac{C1}{TG}
\end{equation}$$

#### Total Gas Volume Summary (TG Sum)

\
To better understand the carbon density of the gases, this research will
also be creating a new indicator. This indicator weights each individual
gas component ($C_1$ through $C_5$) by its number of carbon atoms to
show how much heavy gas is in the total mixture. The indicator is
calculated as follows:

$$\begin{equation}
I_{\text{carbon}} = \frac{Derived TG}{C_1 + 2C_2 + 3C_3 + 4iC_4 + 4nC_4 + 5iC_5 + 5nC_5}
\end{equation}$$

where $TG$ is the total gas value taken directly from the mudlogging
data or as stated before, from the formula. Because heavier fluids like
oil naturally have more carbon atoms per molecule, a lower value in this
final ratio indicates a shift toward heavier, more complex carbon
chains. Therefore, a lower score points to a higher chance of finding an
oil-bearing zone.

#### Dryness Ratio

\
The dryness factor isolates the exact percentage of methane within the
absolute gas volume to quickly verify gas purity:

$$\begin{equation}
    \text{Dryness} = \frac{C1}{TG}
\end{equation}$$

#### Expanded Haworth Gas Ratios

\
The system relies heavily on the foundational show evaluation methods
created by @haworth1985 and documented by @ref12, which break down gas
mixtures into Wetness ($W_h$), Balance ($B_h$), and Character ($C_h$)
metrics. While the original @haworth1985 equations were limited to a
$C_1$ through $C_3$ framework due to older field technology, this
application expands the formulas to incorporate modern $C_4$ and $C_5$
data rows:

$$\begin{equation}
    W_h = \left( \frac{C2 + C3 + iC4 + nC4 + iC5 + nC5}{TG} \right) \times 100
\end{equation}$$

$$\begin{equation}
    B_h = \frac{C1 + C2}{C3 + iC4 + nC4 + iC5 + nC5}
\end{equation}$$

$$\begin{equation}
    C_h = \frac{iC4 + nC4 + iC5 + nC5}{C3}
\end{equation}$$

These three expanded values act as the core decision tree for the app:
$W_h$ identifies the fluid richness, $B_h$ cross-checks the
gas-to-liquid boundaries, and $C_h$ characterizes the underlying fluid
type [@haworth1985; @ref12].

#### Composite Fluid and Gas-Oil Ratio (GOR) Indicators

\
To automate final zone classifications, the engine uses composite
indicators that compare specific gas volumes against the total gas
background [@ref14].

The first indicator evaluates the heavy gas fractions relative to the
total gas volume: $$\begin{equation}
    GOW = (C_3 + iC_4 + nC_4 + iC_5 + nC_5) \times TG
\end{equation}$$

To prevent the total volume from overriding the gas composition, a
modified version isolates the heavy components by dividing them by the
total gas: $$\begin{equation}
    GOW_{\text{noTG}} = \frac{C_3 + iC_4 + nC_4 + iC_5 + nC_5}{TG}
\end{equation}$$ The $GOW_{\text{noTG}}$ indicator strips out the raw
$TG$ multiplier. This adjustment keeps the classification accurate even
if baseline gas readings are altered by drilling fluid noise, mud weight
changes, or fluctuating penetration rates.

To score the overall quality and type of a hydrocarbon zone, the system
calculates a Wetness-Balance Score ($WBS$) by mathematically combining
the Haworth lines: $$\begin{equation}
    WBS = \frac{\log(B_h) - \log(8)}{\log(1000) - \log(8)} - \frac{\log(W_h)}{\log(100)}
\end{equation}$$

Finally, a simplified Gas-Oil Ratio ($GOR$) index evaluates whether a
zone is gas-capped or liquid-heavy. It uses conditional logic rules
based on specific concentration thresholds [@ref14]: $$\begin{equation}
    GOR = \begin{cases} 0 & \text{if } 0.8 < TG < 1.2 \text{ and } C_1 > 2000 \text{ ppm} \\ 1 & \text{otherwise} \end{cases}
\end{equation}$$

The combined outputs from these equations feed directly into a
rule-based expert matrix [@ref1]. This matrix cross-references the
intersecting ratio values to automatically label each meter of rock as a
\"Gas Zone,\" \"Oil Zone,\" or \"Water Zone\" without requiring manual
human interpretation.

### User Interface & Plotly Graph Design

To ensure that this application will be intuitive and simple to utilize,
the frontend of the software is built using the modern *Dash Python
Framework* combined with *dash bootstrap components* (`dbc`). This setup
replaces the unintuitive, confusing, and outdated user interfaces found
in older petrophysical software with a clean, responsive layout.

#### Reactive Frontend Architecture

\
The layout is designed around a single-page interactive dashboard. To
keep the workspace organized and clean, heavy file management tasks are
hidden inside popup windows using `dbc.Modal` containers. The primary
interface components include:

- **dbc.Button:** Standardized triggers that control file loading,
  calculation execution, and report generation depending on user clicks.

- **dcc.Upload:** An drag-and-drop file receiver built inside a
  `dbc.Modal` box, allowing users to upload CSV or TXT log files
  cleanly.

- **app.callback:** The core reactive mechanism of the application.
  These python functions instantly detect user input---such as a file
  upload or a slider adjustment---and recalculate the formulas behind
  the scenes, That retrieves or posts data into the desired outputs.

#### Dynamic Log Plotting with Plotly

\
Once the core engine finishes running the formulas, the calculated data
columns are rendered side-by-side using the *Plotly* library. The
dashboard automatically builds continuous vertical area charts that
mimic traditional corporate mud logging templates. The calculated
Haworth wetness indices, Pixler points, and automated zone flags are
locked to their exact depth markers. This setup allows geologists to
scroll down a single web page and instantly spot high-potential oil or
gas targets through clean, interactive visualizations.

## Evaluation Metrics

To evaluate the performance of the hydrocarbon zone classification
system, the predicted outputs are compared against actual well test
results as ground truth. Because the system produces **categorical**
outputs \[assigning each depth interval a discrete label (gas-bearing,
oil-bearing, or water-bearing)\]. Therefore, the most relatable
classification performance is instead measured through the framework of
the **confusion matrix**, which tallies predicted labels against true
labels for every class, yielding four fundamental counts per class: true
positives (TP), true negatives (TN), false positives (FP), and false
negatives (FN). From these counts, four standard metrics are derived
[@powers2011]. All metrics are computed using **macro averaging**, which
calculates each metric independently per class and then takes the
unweighted mean, giving equal weight to every zone class regardless of
its frequency in the dataset. This is appropriate here because a
misclassification of a minority zone type (e.g., a rare oil-bearing
interval) carries the same practical consequence as a misclassification
of a more common class.

$$\begin{equation}
    \text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
\end{equation}$$ $$\begin{equation}
    \text{Precision} = \frac{TP}{TP + FP}
\end{equation}$$ $$\begin{equation}
    \text{Recall} = \frac{TP}{TP + FN}
\end{equation}$$ $$\begin{equation}
    \text{F1-Score} = 2 \times
        \frac{\text{Precision} \times \text{Recall}}
             {\text{Precision} + \text{Recall}}
\end{equation}$$

Accuracy measures the overall proportion of correctly classified depth
intervals. Precision measures how many of the intervals predicted as a
certain class actually belong to that class, reflecting how few false
positives the system produces. Recall measures how many of the actual
instances of each class were successfully detected, reflecting the
system's ability to avoid missing true hydrocarbon zones. The F1-Score
serves as the primary metric in this study, as it provides a single
balanced measure that accounts for both Precision and Recall
simultaneously, which is especially important when the distribution of
zone types across the well is uneven.